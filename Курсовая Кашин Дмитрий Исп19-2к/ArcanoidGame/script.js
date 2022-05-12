const canvas = document.querySelector('canvas') // обращение к дом элементу
const context = canvas.getContext('2d')

// данные канваса
canvas.width = 500
canvas.height = 500

// Добавляем изображение
let image = new Image
image.src = "image.png"

// Добавляем изображение
let space = new Image
space.src = "space.jpg"

// координаты мяча, платформы, блоков
const atlas = {
    ball: { x: 4, y: 588, width: 36, height: 36 },
    grey: { x: 232, y: 0, width: 42, height: 20 },
    brown: { x: 232, y: 36, width: 42, height: 20 },
    platforma: { x: 109, y: 177, width: 208, height: 15 }
}

const ball = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 10,
    height: 10,
    speed: 200,
    angle: Math.PI / 4 + Math.random() * Math.PI / 2
}

const platforma = {
    x: canvas.width / 2 - 100,
    y: canvas.height - 30,
    width: 150,
    height: 20,
    speed: 200,
    leftKey: false,
    rightKey: false,
}

const blocks = []
// Добавление остальных блоков с рандомным цветом 
for(let x = 0; x < 8; x++) {
    for (let y = 0; y < 10; y++) {
        blocks.push({
            x: 50 + 50 * x,
            y: 50 + 20 * y,
            width: 50,
            height: 20,
            color: getRandomFrom(["grey", "brown"])
        })
    }
}

// 4 невидисых блока по краям канваса. Расположены с внешней стороны вплотную.
const limits = [
    { x: 0, y: -20, width: canvas.width, height:20 },
    { x: canvas.width, y: 0, width: 20, height: canvas.height },
    { x: 0, y: canvas.height, width: canvas.width, height: 5 },
    { x: -20, y: 0, width: 20, height: canvas.height },
]
 
// регистрирует определённый обработчик события
// Нажатия клавишей клавиатуры 
document. addEventListener("keydown", function (event) { 
    if (event.key === "ArrowLeft") {
        platforma.leftKey = true
    }

    else if (event.key === "ArrowRight") {
        platforma.rightKey = true
    }
    // Если конец игры нужно нажать Enter
    else if (plaing === false && event.key === "Enter") {
        plaing = true

        // свойство объектов без смен ссылки на этот объект
        Object.assign (ball, {
            x: canvas.width / 2,
            y: canvas.height - 50,
            width: 10,
            height: 10,
            speed: 200,
            angle: Math.PI / 4 + Math.random() * Math.PI / 2
        })
        
          // свойство объектов без смен ссылки на этот объект
        Object.assign (platforma, {
            x: canvas.width / 2 - 100,
            y: canvas.height - 30,
            width: 150,
            height: 20,
            speed: 200,
            leftKey: false,
            rightKey: false,
        })
        
        blocks.splice(0, blocks.length - 1)
        for(let x = 0; x < 8; x++) {
            for (let y = 0; y < 10; y++) {
                blocks.push({
                    x: 50 + 50 * x,
                    y: 50 + 20 * y,
                    width: 50,
                    height: 20,
                    color: getRandomFrom(["grey", "brown"])
                })
            }
        }
    }
})

document. addEventListener("keyup", function (event) { 
    if (event.key === "ArrowLeft") {
        platforma.leftKey = false
    }

    else if (event.key === "ArrowRight") {
        platforma.rightKey = false
    }
})


requestAnimationFrame(loop)

let pTimestamp = 0
let plaing = true
function loop (timestamp) {
    requestAnimationFrame(loop)

    clearCanvas ()

    if (plaing) {
    const dTimestamp = Math.min(16.7, timestamp - pTimestamp)
    const secondPart = dTimestamp / 1000
    pTimestamp = timestamp
    // Движение мячика    
    ball.x += secondPart * ball.speed * Math.cos(ball.angle)
    ball.y -= secondPart * ball.speed * Math.sin(ball.angle)

    // Движение платформы.
    // Если должна двигаться влево
    if (platforma.leftKey) {
        // Подвинуть левее, но не далее границы поля.
        platforma.x = Math.max(0, platforma.x - secondPart * platforma.speed)
    }

    // Если должна двигаться вправо
    if (platforma.rightKey) {
        // Подвинуть правее, но не далее границы поля.
        platforma.x = Math.min(canvas.width - platforma.width, platforma.x + secondPart * platforma.speed)
    }
    // Пройти по всем блокам.
    for (const block of blocks) {
        // Если мя столкнулся с выбранным блоком
        if (isIntersection(block, ball)) {
            // Удалить блок
            toggleItem(blocks, block)

            // Создать 4 контрольных блока чтобы понять, с какой стороны ударил мяч
            // Верхний
            const ctrl1 = {
                x: block.x - 10,
                y: block.y - 10,
                width: 10 + block.width,
                height: 10
            }
            
            // Правый
            const ctrl2 = {
                x: block.x + block.width,
                y: block.y - 10,
                width: 10,
                hight: 10 + block.height
            }

            // Нижний
            const ctrl3 = {
                x: block.x,
                y: block.y + block.height,
                width: block.width + 10,
                hight: 10
            }

            // Левый
            const ctrl4 = {
                x: block.x - 10,
                y: block.y,
                width: 10 ,
                hight: block.height + 10
            }

            // Если мяч столкнулся с верхним или нижним вспомогательным блоком
            if (isIntersection(ctrl1, ball) || isIntersection(ctrl3, ball)) {
                ball.angle = Math.PI * 2 - ball.angle
            }

            // Если мя столкнулся с правым или левым вспомогательным блоком
            else if (isIntersection(ctrl2, ball) || isIntersection(ctrl4, ball)) {
                ball.angle = Math.PI - ball.angle
            }

            break
        }
    }

    // Если мяч ударил в верхнию платформу 
    if (isIntersection(limits[0], ball)) {
        ball.angle = Math.PI * 2 - ball.angle
    }

    // Если мяч ударил в правую или левую  платформу
    if (isIntersection(limits[1], ball) || isIntersection(limits[3], ball)) {
        ball.angle = Math.PI - ball.angle
    }

    // Траектория полета 
    if (isIntersection(platforma, ball)) {
       const x = ball.x + ball.width / 2
       const percent = (x - platforma.x) / platforma.width
       ball.angle =  Math.PI - Math.PI * 8 / 10 * (percent + 0.05)
    }
     
    // конец игры
     if (isIntersection(limits[2], ball)) {
         plaing = false
     }
}

    // Рисуем мяч
    drawBall(ball)

    for (const block of blocks) {
        // Рисуем блок
        drawBlock(block)
    }

    // Рисуем платформу
    drawPlaforma(platforma)

    // Вывод информации
    if (!plaing) {
        drawResult()
    }
}

// Функция очищает канвас
function clearCanvas () {
    context.drawImage(space, 0, 0, canvas.width, canvas.height)
}

// Функция рисует прямоугольник с параметрами из объекта param
function drawRect (param) {
    context.beginPath()
    context.rect(param.x, param.y, param.width, param.height)
    context.strokeStyle = 'blue'
    context.stroke()
}

// Функция возвращает true, если произошло столкновениме 2-х блоков
function isIntersection (blockA, blockB) {
    // вершины блока А
    const pointsA = [
        { x: blockA.x, y: blockA.y },
        { x: blockA.x + blockA.width, y: blockA.y },
        { x: blockA.x, y: blockA + blockA.height },
        { x: blockA.x + blockA.width, y: blockA.y + blockA.height }
    ]
    // Пройти по всем вершинам блока А
    for (const pointA of pointsA) {
        // Находиться ли какая либо точка блока А в внутри блока B?
        if (blockB.x <= pointA.x && pointA.x <= blockB.x + blockB.width && blockB.y <= pointA.y && pointA.y <= blockB.y + blockB.height) {
            return true
        }
    }

    // Вершины блока В
    const pointsB = [
        { x: blockB.x, y: blockB.y },
        { x: blockB.x + blockB.width, y: blockB.y },
        { x: blockB.x, y: blockB + blockB.height },
        { x: blockB.x + blockB.width, y: blockB.y + blockB.height }
    ]
    // Пройти по всем вершинам блока В
    for (const pointB of pointsB) {
        // Находиться ли какая либо точка блока В в внутри блока А?
        if (blockA.x <= pointB.x && pointB.x <= blockA.x + blockA.width && blockA.y <= pointB.y && pointB.y <= blockA.y + blockA.height) {
            return true
        }
    }
    return false
}

function toggleItem (array, item){
    if(array.includes(item)){
        const index = array.indexOf (item)
        array.splice(index, 1)
    }
    
    else {
        array.push(item)
    }
}

// Вырезаем мяч и рисуем изображение
function drawBall (ball) {
    context.beginPath()
    context.drawImage(
        image,
        atlas.ball.x, atlas.ball.y, atlas.ball.width, atlas.ball.height,
        ball.x, ball.y, ball.width, ball.height
    )
}

// Вырезаем блок и рисуем изображение
function drawBlock (block) {
    context.drawImage(
        image,
        atlas[block.color].x, atlas[block.color].y, atlas[block.color].width, atlas[block.color].height,
        block.x, block.y, block.width, block.height
    )
}

// Вырезаем платформу и рисуем изображение
function drawPlaforma (platforma) {
    context.drawImage(
        image,
        atlas.platforma.x, atlas.platforma.y, atlas.platforma.width, atlas.platforma.height,
        platforma.x, platforma.y, platforma.width, platforma.height
    )
}

// Функция будет возвращать случайное число из массива и наоборот 
function getRandomFrom (array) {
    const index = Math.floor(Math.random() * array.length)
    return array [index]
}

// Вывод информации, затемнение, цвет, шрифт, расположение
function  drawResult () {
    context.beginPath()
    context.rect(0, 0, canvas.width, canvas.height)
    context.fillStyle = "rgba(255, 255, 255, 0.5)"
    context.fill()

    context.fillStyle = "black"
    context.font = "50px Times New Roman"
    context.textAlign = "center"
    context.fillText("Game over", canvas.width / 2, canvas.height / 2 - 50)

    context.fillStyle = "black"
    context.font = "30px Times New Roman"
    context.textAlign = "center"
    context.fillText("Для продолжения нажмите Enter", canvas.width / 2, canvas.height / 2 - 20)
}