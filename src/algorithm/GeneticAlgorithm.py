import json
import math
import random
import sys

import numpy as np

# Number of individuals in each generation


# Target string to be generated
# Target is assumed each list has only 1 coordinate, x and y
#TARGET_INPUT = [[1, 2], [63, 48],[55,12],[8,7],[32,51],[72,82],[44,44]]
#TARGET_INPUT = sys.argv[1]
#print(json.dumps(TARGET_INPUT))
# TARGET_INPUT[i][0] is the x coordinate
# TARGET_INPUT[i][1] is the y coordinate

# TARGET_INPUT = []

# make a starting pos list in individual
# change fitness function to work on lists

# change the way the fitness function calculates the fitness

class Individual(object):

    ''' 
    Class representing individual in population 
    '''

    def __init__(self, chromosome, TARGET_INPUT):
        self.curr_locs = [] # used for fitness
        self.sp = []
        self.chromosome = chromosome #Game of Life board starting pos
        self.next_state = chromosome  # intermediate state
        self.last_state = chromosome #Game of life board ending pos
        self.delta = 0 #amount of moves made in Game of Life
        self.fitness = 50000 # init as a very low fitness 
        self.TARGET_INPUT = TARGET_INPUT

    def mutated_genes(self):
        ''' 
        create random genes for mutation 
        '''
        gene = random.randint(0,1)
        return gene

    @classmethod
    def create_gnome(self):
        ''' 
        create a new chromosome (new game of life starting positions)
        At the middle of the board
        '''
        chromosome = np.zeros((100,100))
        for _ in range(25):
            x = random.randint(45,55)
            y = random.randint(45,55)
            chromosome[x][y] = 1
        return chromosome

    def starting(self):
        for x in range(0,99):
            for y in range(0,99):
                if self.chromosome[x][y]==1:
                    self.sp.append([x,y])

    
    # update game of life
    def evolve(self):
        '''
        Evolve using the starting chromosome
        '''
        for x in range(0,99):
            for y in range(0,99):
                neighbors = 0
                if self.last_state[x-1][y-1] == 1:
                    neighbors+=1
                if self.last_state[x][y-1] == 1:
                    neighbors+=1
                if self.last_state[x+1][y-1] == 1:
                    neighbors+=1
                if self.last_state[x-1][y] == 1:
                    neighbors+=1
                if self.last_state[x+1][y] == 1:
                    neighbors+=1
                if self.last_state[x-1][y+1] == 1:
                    neighbors+=1
                if self.last_state[x][y+1] == 1:
                    neighbors+=1
                if self.last_state[x+1][y+1] == 1:
                    neighbors+=1
                if self.last_state[x][y] == 0:
                    if neighbors == 3:
                        self.next_state[x][y] = 1
                    else:
                        if neighbors < 2:
                            self.next_state[x][y] = 0
                        elif neighbors > 3:
                            self.next_state[x][y] = 0
                        else:
                            self.next_state[x][y] = 1
        self.last_state = self.next_state
        self.delta+=1

    def mate(self, par2):
        """
        Take two parents, return two children, interchanging half of the allels of each parent randomly
        """
        child1 = []
        child2 = []
        loop = 0
        if len(self.sp) != len(par2.sp):
            return self.sp, par2.sp
        if len(self.sp) <= len(par2.sp):
            loop = len(self.sp)
        else:
            loop = len(par2.sp)
        for id in range(loop):
            egg = self.sp[id]
            sperm = par2.sp[id]
            number = random.randint(0,100)
            if number < 33:
                child1.append(egg)
                child2.append(egg)
            elif number < 66:
                child1.append(sperm)
                child2.append(sperm)
            else:
                child1.append(egg)
                child2.append(sperm)
        return child1, child2


    def cal_fitness(self):
        ''' 
        Calculate fitness score, it is how many targets left. Lower the score the more targets hit
        '''

        self.fitness = 0
        for x in range(0,99):
            for y in range(0,99):
                if self.last_state[x][y] == 1:
                    self.curr_locs.append([x,y])
                    
        # Add fitness score for every point not included in target
        if len(self.curr_locs) < len(self.TARGET_INPUT) * 5:
            self.fitness = 10000
            print(len(self.curr_locs))
        for e in range(len(self.curr_locs)):
            ent = self.curr_locs[e]
            closest = 1000
            for i in range(len(self.TARGET_INPUT)):
                t = self.TARGET_INPUT[i]
                distX = ent[0] - t[0]
                distY = ent[1] - t[1]
                dist = math.sqrt(math.pow(distX,2) + math.pow(distY, 2))
                if dist < closest:
                    closest = dist
                if closest <= 5:
                    self.fitness -=10
            self.fitness += closest
        if self.fitness == 0:
            self.fitness = 10000
        self.fitness = (self.fitness/len(self.curr_locs))
        print(len(self.curr_locs))
        print(self.fitness)


# Driver code

def main(bigman):
    POPULATION_SIZE = 20
    TARGET_INPUT = bigman
    MAX_TARGET = 10

    # current generation

    generation = 0
    found = False
    population = []

    # create initial population

    for _ in range(POPULATION_SIZE):
        gnome = Individual.create_gnome()
        population.append(Individual(gnome, TARGET_INPUT))

    while not found:

        # sort the population in increasing order of fitness score

        population = sorted(population, key=lambda x: x.fitness)

        # if the individual having lowest fitness score ie.
        # 0 then we know that we have reached to the target
        # and break the loop

        # Going for 90% hit accuracy 

        if population[0].fitness <= int(MAX_TARGET*0.90):
            found = True
            break

        # Otherwise generate new offsprings for new generation

        new_generation = []

        # Perform Elitism, that mean 10% of fittest population
        # goes to the next generation

        s = int(10 * POPULATION_SIZE / 100)
        new_generation.extend(population[:s])

        # From 50% of fittest population, Individuals
        # will mate to produce offspring

        s = int(90 * POPULATION_SIZE / 100)
        for _ in range(s):
            parent1 = random.choice(population[:50])
            parent2 = random.choice(population[:50])
            parent1.starting()
            parent2.starting()
            child1, child2 = parent1.mate(parent2)
            # convert child into numpy
            child = np.zeros((100,100))
            for x in range(0,99):
                for y in range(0,99):
                    if [x,y] in child1:
                        child[x][y] = 1

            new_generation.append(Individual(child, TARGET_INPUT))
            #new_generation.append(child2)

        population = new_generation

        # Evolve the new generation by x moves of the game of life
        for x in range(POPULATION_SIZE):
            while population[x].delta < 50: # CHANGE THIS
                population[x].evolve()
                print(population[x].delta)
            population[x].cal_fitness()

        generation += 1
        print("GENERATION:",generation)
        # print("last",population[0].chromosome[50])
        #for x in range(POPULATION_SIZE):
            #print(population[x].chromosome[45])
            #print(population[x].fitness)

    
    #out of loop when fit individual is found
    #turn into a list of lists and return?
    rows = population[0].chromosome.shape[0]
    cols = population[0].chromosome.shape[1]
    result = []

    # print("pop0", population[0].chromosome.shape[1])


    for x in range(0,rows):
        for y in range(0,cols):
            print("goes in if", population[0].chromosome[x][y] == 1)
            if population[0].chromosome[x][y] == 1:
                result.append([x,y])
    return result
