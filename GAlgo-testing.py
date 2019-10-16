import random
from datetime import datetime


def random_generator(size=75, chars="01"):
    return ''.join(random.choice(chars) for x in range(size))

# Number of individuals in each generation
POPULATION_SIZE = 175

# Valid genes
# 0 = empty space
# 1 = triangle
# 2 = player
# 3 = me
GENES = "0123"
TARGET = random_generator()

# Target string to be generated
# TARGET = "0000000111001100001111001111100010000300000020002000200002000000"


class Individual(object):
    '''
    Class representing individual in population
    '''

    def __init__(self, chromosome):
        self.chromosome = chromosome
        self.fitness = self.cal_fitness()

    @classmethod
    def mutated_genes(self):
        '''
        create random genes for mutation
        '''
        global GENES
        gene = random.choice(GENES)
        return gene

    @classmethod
    def create_gnome(self):
        '''
        create chromosome or string of genes
        '''
        global TARGET
        gnome_len = len(TARGET)
        return [self.mutated_genes() for _ in range(gnome_len)]

    def mate(self, par2):
        '''
        Perform mating and produce new offspring
        '''

        # chromosome for offspring
        child_chromosome = []
        for gp1, gp2 in zip(self.chromosome, par2.chromosome):

            # random probability
            prob = random.random()

            # if prob is less than 0.45, insert gene
            # from parent 1
            if prob < 0.45:
                child_chromosome.append(gp1)

            # if prob is between 0.45 and 0.90, insert
            # gene from parent 2
            elif prob < 0.90:
                child_chromosome.append(gp2)

            # otherwise insert random gene(mutate),
            # for maintaining diversity
            else:
                child_chromosome.append(self.mutated_genes())

            # create new Individual(offspring) using
        # generated chromosome for offspring
        return Individual(child_chromosome)

    def cal_fitness(self):
        '''
        Calculate fittness score, it is the number of
        characters in string which differ from target
        string.
        '''
        global TARGET
        fitness = 0
        for gs, gt in zip(self.chromosome, TARGET):
            if gs != gt: fitness += 1
        return fitness

    # Driver code

def cal_fitness (gene, target):
    fitness = 0
    for gene_in_sequence, gene_in_target in zip(gene,target):
        if gene_in_sequence != gene_in_target: fitness += 1
    return fitness

def min_index(arr):
    minim = 0
    count = 1
    for x in arr[1:]:
        if x < arr[minim]: minim = count
        count += 1
    return minim

def top_guesses(all):
    top = []
    for guess in all:
        if guess.fitness == all[0].fitness:
            top.append(guess)
    return top

def top_guess(top):
    fitness_of_top = []
    fitness = top[0].fitness
    for test_gene in top:
        curr_fitness = 0;
        for target_gene in top:
            curr_fitness += cal_fitness(test_gene.chromosome,target_gene.chromosome)
        fitness_of_top.append(curr_fitness)
    min_idx = min_index(fitness_of_top)
    return top[min_idx]


def run_ga():

    global POPULATION_SIZE

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
        if population[0].fitness <= 0:
            found = True
            break

        # Otherwise generate new offsprings for new generation
        new_generation = []

        # Perform Elitism, that mean 10% of fittest population
        # goes to the next generation
        s = int((10 * POPULATION_SIZE) / 100)
        new_generation.extend(population[:s])

        # From 50% of fittest population, Individuals
        # will mate to produce offspring
        s = int((90 * POPULATION_SIZE) / 100)
        top_gene = top_guess(top_guesses(population[:10]))
        prob = random.random()
        test = 1

        for _ in range(s):
            if test:
                if prob < .3: parent1 = top_gene
                else: parent1 = random.choice(population[:10])
            else: parent1 = random.choice(population[:10])
            parent2 = random.choice(population[:10])
            child = parent1.mate(parent2)
            new_generation.append(child)

        population = new_generation

        # print("Generation: {}\tString: {}\tFitness: {}".format(generation,
        #                                                        "".join(population[0].chromosome),
        #                                                        population[0].fitness))

        generation += 1

    print("Generation: {}\tString: {}\tFitness: {}".format(generation,
                                                           "".join(population[0].chromosome),
                                                           population[0].fitness))
    return generation



def benchmarker():
    count = 0
    tot_gen_count = 0
    max_gens = 30
    total_time = 0
    epoch = datetime.utcfromtimestamp(0)
    def unix_time_millis(dt):
        return (dt - epoch).total_seconds() * 1000.0
    while count < max_gens:
        start_time = unix_time_millis(datetime.now())
        tot_gen_count += run_ga()
        end_time = unix_time_millis(datetime.now())
        count += 1
        total_time = total_time + (end_time - start_time)
    print("Average generations: ", tot_gen_count/max_gens)
    print("Average time: ", total_time/max_gens)

