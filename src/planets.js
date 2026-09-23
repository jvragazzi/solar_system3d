export const planets = [
  {
    id: "mercurio", name: "Mercúrio", type: "Planeta rochoso", order: 1,
    radius: 1.25, distance: 12, speed: 0.48, texture: "2k_mercury.jpg", color: "#a8a29e", moons: 0,
    summary: "O menor planeta e o vizinho mais próximo do Sol. Seu mundo é coberto por crateras e enfrenta temperaturas extremas.",
    facts: [["Temperatura", "167 °C", "média"], ["Um dia", "59 dias", "terrestres"], ["Um ano", "88 dias", "terrestres"], ["Luas", "0", "conhecidas"]],
    comparison: "Tem cerca de 38% do diâmetro da Terra.",
    details: "Mercúrio quase não possui atmosfera para reter calor. Por isso, pode passar de 430 °C durante o dia e cair abaixo de -180 °C à noite.",
    curiosity: "Apesar de ser o mais próximo do Sol, Mercúrio não é o planeta mais quente. Esse título pertence a Vênus.",
    quiz: { question: "Quanto dura aproximadamente um ano em Mercúrio?", options: ["24 horas", "88 dias", "365 dias"], answer: 1, explanation: "Mercúrio completa sua volta ao Sol em apenas 88 dias terrestres." }
  },
  {
    id: "venus", name: "Vênus", type: "Planeta rochoso", order: 2,
    radius: 1.8, distance: 17, speed: 0.35, texture: "2k_venus_surface.jpg", color: "#f5b942", moons: 0,
    summary: "Um mundo envolto por nuvens espessas e brilhantes. Vênus tem uma atmosfera poderosa que aprisiona o calor.",
    facts: [["Temperatura", "464 °C", "média"], ["Um dia", "243 dias", "terrestres"], ["Um ano", "225 dias", "terrestres"], ["Luas", "0", "conhecidas"]],
    comparison: "Possui quase o mesmo tamanho da Terra: cerca de 95% do diâmetro.",
    details: "Sua atmosfera é formada principalmente por dióxido de carbono. O efeito estufa é tão intenso que sua superfície é mais quente que a de Mercúrio.",
    curiosity: "Vênus gira ao contrário da maioria dos planetas. Lá, o Sol nasceria no oeste.",
    quiz: { question: "Por que Vênus é o planeta mais quente?", options: ["Está mais perto do Sol", "Possui muitos vulcões", "Sua atmosfera retém calor"], answer: 2, explanation: "A atmosfera espessa de Vênus provoca um efeito estufa extremamente forte." }
  },
  {
    id: "terra", name: "Terra", type: "Planeta rochoso", order: 3,
    radius: 2, distance: 23, speed: 0.30, texture: "2k_earth_daymap.jpg", color: "#50a7ff", moons: 1,
    summary: "Nosso lar no cosmos. A Terra é o único mundo conhecido com oceanos de água líquida e uma enorme diversidade de vida.",
    facts: [["Temperatura", "15 °C", "média"], ["Um dia", "24 horas", "aprox."], ["Um ano", "365 dias", "e 6 horas"], ["Luas", "1", "a Lua"]],
    comparison: "A Terra é nossa unidade de comparação: 12.742 km de diâmetro.",
    details: "Cerca de 71% da superfície terrestre é coberta por água. Sua atmosfera rica em nitrogênio e oxigênio ajuda a regular a temperatura e protege a vida.",
    curiosity: "A Terra não é uma esfera perfeita. Ela é ligeiramente achatada nos polos e mais larga no equador.",
    quiz: { question: "Quanto da superfície da Terra é coberta por água?", options: ["Cerca de 30%", "Cerca de 50%", "Cerca de 71%"], answer: 2, explanation: "Os oceanos cobrem aproximadamente 71% da superfície do nosso planeta." }
  },
  {
    id: "marte", name: "Marte", type: "Planeta rochoso", order: 4,
    radius: 1.5, distance: 30, speed: 0.24, texture: "2k_mars.jpg", color: "#ef6a47", moons: 2,
    summary: "O planeta vermelho guarda desertos gelados, vulcões gigantes e sinais de que a água correu por sua superfície no passado.",
    facts: [["Temperatura", "-63 °C", "média"], ["Um dia", "24,6 horas", "aprox."], ["Um ano", "687 dias", "terrestres"], ["Luas", "2", "conhecidas"]],
    comparison: "Tem aproximadamente metade do diâmetro da Terra.",
    details: "Marte possui uma atmosfera muito fina, composta principalmente por dióxido de carbono. Robôs exploradores estudam seu solo e procuram evidências de vida antiga.",
    curiosity: "O Monte Olimpo, em Marte, é o maior vulcão conhecido do Sistema Solar e tem cerca de 22 km de altura.",
    quiz: { question: "Como Marte ganhou sua cor avermelhada?", options: ["Por causa de lava", "Por óxido de ferro no solo", "Pela luz do Sol"], answer: 1, explanation: "O ferro presente no solo marciano oxidou, produzindo uma cor semelhante à ferrugem." }
  },
  {
    id: "jupiter", name: "Júpiter", type: "Gigante gasoso", order: 5,
    radius: 4.8, distance: 43, speed: 0.13, texture: "2k_jupiter.jpg", color: "#d9a47e", moons: 95,
    summary: "O maior planeta do Sistema Solar. Júpiter é um gigante de gases, tempestades intensas e dezenas de luas fascinantes.",
    facts: [["Temperatura", "-110 °C", "nas nuvens"], ["Um dia", "9,9 horas", "aprox."], ["Um ano", "11,9 anos", "terrestres"], ["Luas", "95+", "confirmadas"]],
    comparison: "Seu diâmetro é 11 vezes maior e caberiam cerca de 1.300 Terras em seu volume.",
    details: "Júpiter é composto principalmente por hidrogênio e hélio. Não possui uma superfície sólida como a Terra e seu campo magnético é extremamente poderoso.",
    curiosity: "A Grande Mancha Vermelha é uma tempestade maior que a Terra observada há séculos.",
    quiz: { question: "O que é a Grande Mancha Vermelha de Júpiter?", options: ["Um oceano", "Uma tempestade", "Uma enorme cratera"], answer: 1, explanation: "Ela é uma tempestade gigantesca que existe há centenas de anos." }
  },
  {
    id: "saturno", name: "Saturno", type: "Gigante gasoso", order: 6,
    radius: 4.2, distance: 58, speed: 0.095, texture: "2k_saturn.jpg", color: "#e7cf8d", moons: 146,
    summary: "Cercado pelo sistema de anéis mais espetacular que conhecemos, Saturno é um mundo leve, ventoso e repleto de luas.",
    facts: [["Temperatura", "-140 °C", "nas nuvens"], ["Um dia", "10,7 horas", "aprox."], ["Um ano", "29,5 anos", "terrestres"], ["Luas", "146+", "confirmadas"]],
    comparison: "Seu diâmetro é cerca de 9 vezes maior que o da Terra.",
    details: "Seus anéis são formados por incontáveis pedaços de gelo e rocha, desde grãos minúsculos até blocos do tamanho de casas.",
    curiosity: "Saturno é menos denso que a água. Em um oceano grande o suficiente, teoricamente ele flutuaria.",
    quiz: { question: "Do que são formados os anéis de Saturno?", options: ["Gás colorido", "Gelo e rocha", "Luz congelada"], answer: 1, explanation: "Bilhares de fragmentos de gelo e rocha formam seus anéis." }, rings: true
  },
  {
    id: "urano", name: "Urano", type: "Gigante de gelo", order: 7,
    radius: 3.3, distance: 73, speed: 0.068, texture: "2k_uranus.jpg", color: "#83d9dc", moons: 28,
    summary: "Um gigante azul-esverdeado que gira praticamente deitado. Urano é um dos mundos mais frios e misteriosos.",
    facts: [["Temperatura", "-195 °C", "média"], ["Um dia", "17 horas", "aprox."], ["Um ano", "84 anos", "terrestres"], ["Luas", "28", "conhecidas"]],
    comparison: "Tem aproximadamente quatro vezes o diâmetro da Terra.",
    details: "O metano em sua atmosfera absorve luz vermelha e contribui para sua cor azul-esverdeada. Seu eixo possui uma inclinação de quase 98 graus.",
    curiosity: "Cada estação do ano em Urano dura aproximadamente 21 anos terrestres.",
    quiz: { question: "O que torna a rotação de Urano especial?", options: ["Ele não gira", "Gira praticamente deitado", "Gira mais rápido que a luz"], answer: 1, explanation: "Seu eixo é tão inclinado que o planeta parece rolar ao redor do Sol." }, rings: true
  },
  {
    id: "netuno", name: "Netuno", type: "Gigante de gelo", order: 8,
    radius: 3.2, distance: 87, speed: 0.054, texture: "2k_neptune.jpg", color: "#426ef0", moons: 16,
    summary: "O planeta mais distante do Sol é um mundo azul, escuro e varrido pelos ventos mais rápidos do Sistema Solar.",
    facts: [["Temperatura", "-200 °C", "média"], ["Um dia", "16 horas", "aprox."], ["Um ano", "165 anos", "terrestres"], ["Luas", "16", "conhecidas"]],
    comparison: "Tem quase quatro vezes o diâmetro da Terra.",
    details: "Netuno recebe muito pouca luz solar, mas ainda apresenta um clima extremamente ativo. Seus ventos podem ultrapassar 2.000 km/h.",
    curiosity: "Desde sua descoberta em 1846, Netuno completou apenas uma volta inteira ao redor do Sol.",
    quiz: { question: "O que se destaca no clima de Netuno?", options: ["Chuvas de areia", "Ventos extremamente rápidos", "Ausência total de movimento"], answer: 1, explanation: "Netuno possui os ventos mais velozes conhecidos entre os planetas." }
  }
];
