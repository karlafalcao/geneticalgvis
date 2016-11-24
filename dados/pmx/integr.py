import math
import random
import statistics
import csv
import imp,os

# ========================================================

# ====================== PARAMETROS ======================

NUM_DAMAS		= 8

PRO_RECOMB		= 0.9
PRO_MUTACAO		= 0.9

TAM_POPULACAO	= 20

MIN_FITNESS		= 1
MAX_AVALIACOES	= 250

NUM_TESTES		= 30

# ========================================================

TAM_GENE_BIN	= math.ceil(math.log(NUM_DAMAS, 2))

# ========================================================

SINGLE_POINT_CROSSOVER		= 0 # implemented
# TWO_POINT_CROSSOVER    		= 1
UNIFORM_CROSSOVER 			= 2 # implemented
# HALF_UNIFORM_CROSSOVER    	= 3
REDUCED_SURROGATE_CROSSOVER = 4 # implemented
SHUFFLE_CROSSOVER    		= 5 # implemented
# SEGMENTED_CROSSOVER    		= 6 
RING_CROSSOVER				= 7 # implemented

SELECTED_CROSSOVER			= SINGLE_POINT_CROSSOVER

# ========================================================

# ================= GERACAO DA POPULACAO =================

def generateSpace():

	ofile  = open('space.csv', "w", newline='')
	writer = csv.writer(ofile)
	writer.writerow(['config','fitness'])
	populacao = generatePopulation(40320, True)
	for i in populacao:
		writer.writerow((str(i), ("%.3f" % fitnesslog(i))))
	ofile.close()
# endDef


def generatePopulation(tamanho, ordenar = False):

	populacao = permutation(tamanho)

	if ordenar:
		populacao.sort(key = fitness)

	return populacao

# endDef

def permutation(tam_lista):

	populacao = []
	permut = list(range(NUM_DAMAS))

	for i in range(tam_lista):

		populacao.append(random.sample(permut, NUM_DAMAS))

	# endFor

	return populacao

# endDef

def binaryStringPermutation(tam_lista):

	return list(map(convertPermut, permutation(tam_lista)))

# endDef

# ========================================================

# ======================= FITNESS ========================

def fitness(individuo):

	fit = 1/(1 + colisionsNumber(individuo))

	return fit

# endDef


def fitnesslog(individuo):

	fit = float(1)/(1 + colisionsNumber(individuo))

	return fit

# endDef

def colisionsNumber(config):

	colisoes = 0

	for i in range(NUM_DAMAS):
		for j in range(i + 1, NUM_DAMAS):

			if abs(config[i] - config[j]) == j - i:
				colisoes += 1
			elif abs(config[i] - config[j]) == 0:
				colisoes += 10

		# endFor
	# endFor

	return colisoes

# endDef

# ========================================================

# =================== SELECAO DE PAIS ====================

def parentSelection(populacao):

	return singleTournament(populacao, 2, 5)

# endDef

def tournament(pop, n_pais, n_cand):
	
	pais = []
	candidatos = list(pop)

	for i in range(n_pais):

		pais.append(max(random.sample(candidatos, n_cand), key = fitness))
		candidatos.remove(pais[i])

	# endFor

	return pais

# endDef

def singleTournament(pop, n_pais, n_cand):

	candidatos = random.sample(pop, n_cand)
	candidatos.sort(key = fitness, reverse = True)

	return candidatos[:n_pais]

# endDef

def roullete(pop, n_pais):

	limite = sum(map(fitness, pop))

	pais = []
	candidatos = list(pop)

	for i in range(n_pais):

		num_aleatorio = random.random() * limite
		j = 0

		while fitness(candidatos[j]) < num_aleatorio:

			num_aleatorio -= fitness(candidatos[j])
			j += 1

		# endWhile

		pais.append(candidatos[j])
		candidatos.pop(j)

		limite -= fitness(pais[i])

	# endFor

	return pais

# endDef

# ========================================================

# ===================== RECOMBINACAO =====================

def recombination(pais):

	if probability(PRO_RECOMB):
		filhos = pmx(pais)
	else:
		filhos = pais

	return filhos

# endDef

def cutAndCrossfill(pais, tam_gene = 1):

	pai1 = pais[0]
	pai2 = pais[1]

	num_genes = math.ceil(len(pai1) / tam_gene)
	i = random.randrange(num_genes) * tam_gene

	filho1 = pai1[:i] + pai2[i:]
	filho2 = pai2[:i] + pai1[i:]

	return [filho1, filho2]

# endDef

def order1(pais):

	pai1 = pais[0]
	pai2 = pais[1]

	filho = [0] * len(pai1)
	aux = []

	[a, b] = random.sample(list(range(0, len(filho))), 2)

	if a > b:
		(a, b) = (b, a)

	filho[a:b] = pai1[a:b]

	for i in range(len(filho)):

		if pai2[i] not in filho[a:b]:
			aux.append(pai2[i])

	# endFor

	filho[:a] = aux[:a]
	filho[b:] = aux[a:]

	return [filho]

# endDef

def pmx(pais):

	pai1 = pais[0]
	pai2 = pais[1]

	filho = [None] * len(pai1)

	[a, b] = random.sample(list(range(0, len(filho))), 2)

	if a > b:
		(a, b) = (b, a)

	filho[a:b] = pai1[a:b]

	for i in range(a, b):

		if pai2[i] not in filho[a:b]:

			j = i

			while j in range(a, b):
				j = pai2.index(pai1[j])
			# endWhile

			filho[j] = pai2[i]

		# endIf

	# endFor

	for i in range(len(filho)):

		if filho[i] == None:
			filho[i] = pai2[i]

	# endFor

	return [filho]

# endDef

def cycle(pais):

	pai1 = pais[0]
	pai2 = pais[1]

	filho1 = [0] * len(pai1)
	filho2 = [0] * len(pai2)
	
	ciclos = []
	lista = list(range(len(pai1)))

	for i in range(len(pai1)):

		ciclo = []
		j = i

		while j in lista:
			ciclo.append(j)
			lista.remove(j)
			j = pai1.index(pai2[j])
		# endWhile

		if len(ciclo) > 0:
			ciclos.append(ciclo)

	# endFor

	(a, b) = (0, 1)

	for i in ciclos:

		for j in i:
			filho1[j] = pais[a][j]
			filho2[j] = pais[b][j]
		# endFor

		(a, b) = (b, a)

	# endFor

	return [filho1, filho2]
	
# endDef

def edgeRecombination(pais):

	pai1 = pais[0]
	pai2 = pais[1]

	filho = []
	bordas = []

	for i in range(len(pai1)):

		borda = []
		lista = []

		(a, b) = (pai1.index(i), pai2.index(i))

		lista.append((a + 1) % len(pai1))
		lista.append((a - 1) % len(pai1))
		lista.append((b + 1) % len(pai2))
		lista.append((b - 1) % len(pai2))

		for j in lista:
			if j not in borda:
				borda.append(j)
		# endFor

		bordas.append(borda)

	# endFor

	i = pais[random.randrange(len(pais))][0]

	while len(filho) < len(pai1):

		filho.append(i)
		bordas = list(map(lambda x: [y for y in x if y != i], bordas))

		if len(bordas[i]) > 0:
			i = min(bordas[i], key = lambda x: len(bordas[x]))
		elif len(filho) < len(pai1):
			i = random.choice([x for x in range(len(bordas)) if x not in filho])

	# endWhile

	return [filho]

# endDef

def ringCrossover(pais):
	pai1 = pais[0]
	pai2 = pais[1]

	length = len(pai1)

	i = random.randrange(1, length)

	filho1 = pai1[i:] + pai2[length-i:][::-1]
	filho2 = pai1[:i][::-1] + pai2[:length-i]

	return [filho1, filho2]

# endDef

def embaralhar(pais, order):
	pai1 = pais[0]
	pai2 = pais[1]

	for i in range(0, len(pai1), 2):
		pai1[order[i]], pai1[order[i+1]] = pai1[order[i+1]], pai1[order[i]]
		pai2[order[i]], pai2[order[i+1]] = pai2[order[i+1]], pai2[order[i]]

	return [pai1, pai2]


def shuffleCrossover(pais):
	pai1 = list(pais[0])
	pai2 = list(pais[1])

	length = len(pai1)

	order = list(range(length))

	random.shuffle(order)

	novosPais = embaralhar([pai1, pai2], order)

	filhos = cutAndCrossfill(novosPais)

	novosFilhos = embaralhar(filhos, order)

	filho1 = ''.join(novosFilhos[0])
	filho2 = ''.join(novosFilhos[1])

	return [filho1, filho2]

# endDef

# ========================================================

# ======================= MUTACAO ========================

def mutation(filho):

	mutante = insertion(filho) if probability(PRO_MUTACAO) else filho
	
	return mutante

# endDef

def insertion(filho, tam_gene = 1):

	[i, j] = random.sample(list(range(0, len(filho), tam_gene)), 2)

	if i > j:
		(i, j) = (j, i)

	i_fim = i + tam_gene
	j_fim = j + tam_gene

	mutante = filho[:i_fim] + filho[j:j_fim] + filho[i_fim:j] + filho[j_fim:]

	return mutante

# endDef

def swap(filho, tam_gene = 1):

	[i, j] = random.sample(list(range(0, len(filho), tam_gene)), 2)

	if i > j:
		(i, j) = (j, i)

	i_fim = i + tam_gene
	j_fim = j + tam_gene

	mutante = filho[:i] + filho[j:j_fim] + filho[i_fim:j] + filho[i:i_fim] + filho[j_fim:]

	return mutante

# endDef

def inversion(filho):

	[i, j] = random.sample(list(range(0, len(filho))), 2)

	if i > j:
		(i, j) = (j, i)

	faixa = filho[i:j+1]
	faixa.reverse()

	mutante = filho[:i] + faixa + filho[j+1:]

	return mutante

# endDef

def scramble(filho):
	QTD_SUBCONJUNTO = 4

	list_orig = list(random.sample(filho, QTD_SUBCONJUNTO))
	list_shuffled = list_orig[:]
	random.shuffle(list_shuffled)

	mutante = filho[:]

	for i in range(QTD_SUBCONJUNTO):
		x = filho.index(list_orig[i])
		mutante[x] = list_shuffled[i]

	return mutante

# endDef

# ========================================================

# =============== SELECAO DE SOBREVIVENTES ===============

def survivorSelection(populacao, novos):

	return elitism(populacao, novos)

# endDef

def replaceWorst(pop, novos):

	pop = pop[len(novos):]

	for i in novos:
		insort(pop, i, fitness)
	# endFor

	return pop

# endDef

def elitism(pop, novos):

	for i in novos:
		insort(pop, i, fitness)
	# endFor

	pop = pop[len(novos):]

	return pop

# endDef

# ========================================================

# ================== FUNCOES AUXILIARES ==================

# >>>>> FUNCOES DE PROBABILIDADE:

def probability(probabilidade):

	return True if random.random() < probabilidade else False

# endDef

# >>>>> FUNCOES DE ORDENACAO:

def insort(lista, elem, funcao):

	(a, b) = (0, len(lista))

	while a < b:
		
		i = int((a + b) / 2)

		if funcao(lista[i]) <= funcao(elem):
			a = i + 1

		if funcao(lista[i]) >= funcao(elem):
			b = i

	# endWhile

	lista.insert(b, elem)

# endDef

# >>>>> FUNCOES DE CONVERSAO BIN <-> DEC:

def toBinStr(valor, tam_min = 0):
	
	bin_str = ""
	aux_str = "0" * tam_min

	while valor > 0:

		bin_str += "0" if valor % 2 == 0 else "1"
		valor = int(valor / 2)

	# endWhile

	if tam_min > len(bin_str):
		bin_str += aux_str[len(bin_str):]

	return bin_str[::-1]

# endDef

def toValue(bin_str):

	valor = 0

	for i in bin_str:

		valor *= 2
		valor += 1 if i == "1" else 0

	# endFor

	return valor

# endDef

# >>>>> FUNCOES DE CONVERSAO DE REPRESENTACAO:

def convertPermut(permut):

	bin_str = ""
	str_len = TAM_GENE_BIN

	for i in permut:
		bin_str += toBinStr(i, str_len)
	# endFor

	return bin_str

# endDef

def convertBinStr(bin_str):

	permut = []
	bin_len = TAM_GENE_BIN

	for i in range(0, len(bin_str), bin_len):

		permut.append(toValue(bin_str[i:i+bin_len]))

	# endFor

	return permut

# endDef

# >>>>> FUNCOES DE DEPURACAO:

def show(populacao, ger):

	print("GERACAO " + str(ger) + ":")

	for i in populacao:
		print(str(i) + " => " + str(fitness(i)))

	print("============================================================")

# endDef

def integration(num_testes):

	dir = "pmx"
	list_modules=os.listdir(dir)
	for module in list_modules:
		if module.split('.')[-1]!='py':
			list_modules.remove(module)
		#endif
	#endfor
	oinfo  = open('info_pmx.csv', "w", newline='')
	oteste = open('pmx.csv', "w", newline='')
	writeri = csv.writer(oinfo)
	writert = csv.writer(oteste)
	writeri.writerow(('populacao','total_cenverg','it_converg','fitmedio'))
	writert.writerow(('config','fitness'))	
	for module in list_modules:
		print (module)
		imp.load_source('module', dir+os.sep+module)
		from module import main
		for i in range(num_testes):
			convergencias = 0
			itr_converg = []
			qtd_convergidos = []
			fitness_med = []	
			#writer.writerow(['config','fitness'])
			print("Teste " + str(i + 1))
			(it_converg, total_converg, fit_medio) = main(False, writert)
			convergencias += 1 if total_converg > 0 else 0
			itr_converg.append(it_converg)
			qtd_convergidos.append(total_converg)
			fitness_med.append(fit_medio)
			#writer.writerow(('dado','valor'))
			writeri.writerow((TAM_POPULACAO,total_converg,it_converg,"%.3f" % fit_medio))
			#writer.writerow(('total_converg', total_converg))
			#writer.writerow(('it_converg', it_converg))
			#writer.writerow(('mdconvergidos', statistics.mean(qtd_convergidos)))
			#writer.writerow(('fitmedio', ("%.3f" % fit_medio)))
		# endFor
	#endFor
	oinfo.close()
	oteste.close()
# endDef

def avaliation(num_testes):

	
	for i in range(num_testes):
		convergencias = 0
		itr_converg = []
		qtd_convergidos = []
		fitness_med = []
		ofile  = open('teste'+str(i)+'.csv', "w", newline='')
		writer = csv.writer(ofile)
		#writer.writerow(['config','fitness'])
		print("Teste " + str(i + 1))

		(it_converg, total_converg, fit_medio) = main(False, writer)

		convergencias += 1 if total_converg > 0 else 0
		
		itr_converg.append(it_converg)
		qtd_convergidos.append(total_converg)
		fitness_med.append(fit_medio)
		ofile.close()

		ofile  = open('info'+str(i)+'.csv', "w", newline='')
		writer = csv.writer(ofile)
		#writer.writerow(('dado','valor'))
		writer.writerow((TAM_POPULACAO,total_converg,it_converg,"%.3f" % fit_medio))
		#writer.writerow(('total_converg', total_converg))
		#writer.writerow(('it_converg', it_converg))
		#writer.writerow(('mdconvergidos', statistics.mean(qtd_convergidos)))
		#writer.writerow(('fitmedio', ("%.3f" % fit_medio)))
		
	# endFor


# endDef




def main(depuracao = True, writer = object):

	#populacao = generatePopulation(TAM_POPULACAO, True)
	populacao = [[0, 2, 1, 3, 4, 6, 5, 7],
	[3, 4, 1, 6, 7, 2, 5, 0],
	[0, 7, 3, 4, 5, 6, 2, 1],
	[6, 1, 4, 5, 0, 7, 2, 3],
	[3, 4, 5, 2, 1, 6, 7, 0],
	[2, 6, 4, 5, 7, 3, 0, 1],
	[1, 3, 4, 7, 6, 5, 0, 2],
	[5, 2, 1, 0, 6, 7, 3, 4],
	[1, 4, 0, 3, 2, 6, 7, 5],
	[2, 1, 0, 5, 7, 6, 4, 3],
	[7, 3, 6, 2, 1, 0, 5, 4],
	[2, 4, 0, 6, 7, 1, 3, 5],
	[7, 0, 2, 5, 6, 3, 4, 1],
	[1, 2, 5, 7, 6, 3, 4, 0],
	[5, 7, 0, 1, 6, 2, 4, 3],
	[5, 7, 1, 6, 4, 3, 2, 0],
	[5, 6, 7, 2, 4, 1, 0, 3],
	[2, 4, 0, 6, 3, 7, 1, 5],
	[5, 1, 7, 3, 2, 4, 6, 0],
	[6, 3, 7, 5, 0, 4, 1, 2]]

	num_avaliacoes = TAM_POPULACAO

	if depuracao:
		show(populacao, 1)

	it_converg = 0

	while num_avaliacoes < MAX_AVALIACOES:

		pais = parentSelection(populacao)


		filhos = recombination(pais)
		filhos = list(map(mutation, filhos))

		populacao = survivorSelection(populacao, filhos)

		for i in populacao:
			writer.writerow([str(i), ("%.3f" % fitnesslog(i))])
		
		num_avaliacoes += len(filhos)

		if it_converg == 0 and fitness(max(populacao, key = fitness)) >= MIN_FITNESS:
			it_converg = int((num_avaliacoes - TAM_POPULACAO) / len(filhos))

	# endWhile

	if depuracao:
		show(populacao, int((num_avaliacoes - TAM_POPULACAO) / 2))

	total_converg = sum(map(lambda x: 1 if fitness(x) >= MIN_FITNESS else 0, populacao))
	fit_medio = sum(map(lambda x: fitness(x), populacao)) / len(populacao)

	return (it_converg, total_converg, fit_medio)

# endDef

# main(True)
# avaliation(50)
