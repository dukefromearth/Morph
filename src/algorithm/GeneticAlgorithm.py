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

TARGET_INPUT = []


# change the way the fitness function calculates the fitness

class Individual(object):

    ''' 
    Class representing individual in population 
    '''

    def __init__(self, chromosome):
        self.chromosome = chromosome #Game of Life board starting pos
        self.next_state = chromosome 
        self.last_state = chromosome #Game of life board ending pos
        self.delta = 0 #amount of moves made in Game of Life
        self.fitness = 50 # init as a very low fitness 

    @classmethod
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
        for _ in range(50):
            x = random.randint(45,55)
            y = random.randint(45,55)
            chromosome[x][y] == 1
        return chromosome
    
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
        # select_mask = np.random.randint(0, 2, size=(20, 20), dtype='bool')
        select_mask = np.random.binomial(1, 0.5, size=(100, 100)).astype('bool')
        child1, child2 = np.copy(par2.chromosome), np.copy(self.chromosome)
        child1[select_mask] = par2.chromosome[select_mask]
        child2[select_mask] = self.chromosome[select_mask]
        return child1, child2

    def cal_fitness(self):
        ''' 
        Calculate fitness score, it is how many targets left. Lower the score the more targets hit
        '''

        self.fitness = 0
        # Add fitness score for every point not included in target
        for i in range(len(TARGET_INPUT)-1):
            if self.last_state[TARGET_INPUT[i][0]][TARGET_INPUT[i][1]] == 0:
                self.fitness+=1

# Driver code

def main(bigman):
    POPULATION_SIZE = 20
    TARGET_INPUT = [[1, 2], [63, 48],[55,12],[8,7],[32,51],[72,82],[44,44]]
    MAX_TARGET = 10

    # current generation

    generation = 0
    found = False
    population = []

    # create initial population

    for _ in range(POPULATION_SIZE):
        gnome = Individual.create_gnome()
        population.append(Individual(gnome))

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
            child1, child2 = parent1.mate(parent2)
            new_generation.append(Individual(child2))
            #new_generation.append(child2)

        population = new_generation

        # Evolve the new generation by x moves of the game of life
        for x in range(POPULATION_SIZE-1):
            while population[x].delta < 50:
                population[x].evolve()
                print(population[x].delta)
            population[x].cal_fitness()

        generation += 1
        print("GENERATION:",generation)
        print(population[0].chromosome[50])
        #for x in range(POPULATION_SIZE):
            #print(population[x].chromosome[45])
            #print(population[x].fitness)

    
    #out of loop when fit individual is found
    #turn into a list of lists and return?
    rows = population[0].chromosome.shape[0]
    cols = population[0].chromosome.shape[1]
    result = []

    for x in range(0,rows):
        for y in range(0,cols):
            if population[0].chromosome[x][y] == 1:
                result.append([x,y])

    return result
