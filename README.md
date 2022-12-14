# Utils PVI

Funções auxiliares da infraestrutura de testes (PVI e Effective)

## Instalando

Abra o terminal, e na pasta do script, execute:

```
npm i @libs-scripts-mep/utils-pvi
```

Inclua em seu .html:

```html
<script src="node_modules/@libs-scripts-mep/utils-pvi/utils-pvi.js"></script>
<script src="node_modules/@libs-scripts-mep/utils-pvi/utils-script.js"></script>
```

## Desinstalando

Abra o terminal, e na pasta do script, execute:

```
npm uninstall @libs-scripts-mep/utils-pvi
```

## Resumo da Classe

```js
//utils-pvi.js

class UtilsPVI {

    /**
     * Retorna o caminho da pasta do script que está sendo executado, baseado no HTML.
     * @returns string
     */
    static getScriptPath() {
        
        let i = location.pathname.slice(location.pathname.indexOf("I:/"), location.pathname.lastIndexOf("/"))
        let c = location.pathname.slice(location.pathname.indexOf("C:/"), location.pathname.lastIndexOf("/"))

        if (i.length < 0) {
            return i
        } else if (C.length < 0) {
            return c
        } else {
            return false
        }
        
    }

    /**
     * Retorna o caminho da pasta do PVI em execucao
     * @returns string
     */
    static getPVIPath() {
        return pvi.runInstructionS("getpvipath", [])
    }

    /**
     * Verifica se e a primeira execucao de teste
     * @returns boolean
     */
    static isFirstExec() {
        if (pvi.getVar("_execcount") == 0) {
            return true
        } else {
            return false
        }
    }

    /**
     * Se encarrega de configurar o teste atraves do arquivo .JSON de configuracao, a partir da requisicao realizada ao effective utilizando o numero de serie informado
     * @param {function} callback 
     */
    static CarregaJson(callback) {
        if (sessionStorage.getItem("ProductCode")) {
            this.requestERP((dataErp) => {
                if (dataErp != null) {
                    this.configuraTeste(callback())
                } else {
                    location.reload()
                }
            })
        } else {
            this.configuraTeste(callback())
        }
    }

    /**
     * retorna dados do servidor para OP ou numero de serie
     * @param {function} callback 
     */
    static requestERP(callback) {
        let number = prompt()
        let httpReq = new XMLHttpRequest()
        let URL = null
        if (number != null) {
            `monta a URL`
        } else {
            location.reload()
        }
        httpReq.onreadystatechange = function () {
            if (httpReq.readyState == 4 && httpReq.status == 200) {
                callback(httpReq.responseText)
            } else if (httpReq.status.toString().match(/[3-5][0-9]{2}/) != null) {
                callback(null)
            }
        }
    }

    /**
     * carrega as configuracões do produto atraves do arquivo Json 
     * @param {number} codigo codigo do produto
     * @param {function} callback funcao de retorno 
     */
    static configuraTeste(codigo, callback) {
        if (!isNaN(codigo)) {
            try {
                fetch("Produtos/" + codigo + ".json")
                    .then(response => response.json())
                    .then((json) => {
                        callback(json)
                    })
            } catch (error) {
                callback(null)
            }
        }
    }

    /**
     * Solicita ao operador para beepar as etiquetas dos componentes de teste que ele esta utilizando
     * @param {String} RegexComponente regex para validar o valor recebido do prompt 
     * @param {String} Mensagem mensagem a ser exibida para operador no prompt
     * @param {function} callback funcao de retorno
     */
    static SolicitaComponenteDeTeste(RegexComponente, Mensagem, callback) {
        let Componente = prompt(Mensagem)

        Componente = Componente.match(RegexComponente)

        if (Componente != null) {
            callback(true, Componente)
        } else {
            callback(false)
        }
    }

    /**
     * Para gravação através do software JLink v7.82 é necessário criar um arquivo com os comandos que serão executados
     * Gera um arquivo temporario na TEMP do windows
     * @param {int} speed frequencia de gravação
     * @param {string} firmware 
     * @param {function} callback 
     */
    static GeraCommandFile(speed, firmware, callback = () => { }) {
        function idUnico() { // gera um id unico para usar como nome do arquivo
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            )
        }

        let id = idUnico()

        pvi.runInstructionS("EXEC", ["cmd.exe", `/c (echo si 1 & echo speed ${speed} & echo r & echo h & echo erase & echo loadfile ${firmware} & echo exit) > %TEMP%/${id}.tmp`, "true", "true"]) // comando que gera o arquivo a partir do cmd

        pvi.runInstructionS("EXEC", ["cmd.exe", "/c echo %TEMP%", "true", "true"]) // captura o caminho da pasta temp
        callback(`${pvi.runInstructionS("getvar", ["_return"])}\\${id}.tmp`) // monta o caminho do arquivo .tmp e retorna para salvar no sessionStorage
    }
}

```

```js
//utils-script.js

class Log {

    static Black = "color: #000000"
    static grey11 = "color: #1C1C1C"
    static grey31 = "color: #4F4F4F"
    static DimGray = "color: #696969"
    static Gray = "color: #808080"
    static DarkGray = "color: #A9A9A9"
    static SlateBlue = "color: #6A5ACD"
    static SlateBlue1 = "color: #836FFF"
    static DarkSlateBlue = "color: #483D8B"
    static MidnightBlue = "color: #191970"
    static DarkBlue = "color: #00008B"
    static Blue = "color: #0000FF"
    static CornflowerBlue = "color: #6495ED"
    static DodgerBlue = "color: #1E90FF"
    static DeepSkyBlue = "color: #00BFFF"
    static SkyBlue = "color: #87CEEB"
    static SteelBlue = "color: #4682B4"
    static LightSteelBlue = "color: #B0C4DE"
    static SlateGray = "color: #708090"
    static Cyan = "color: #00FFFF"
    static DarkTurquoise = "color: #00CED1"
    static Turquoise = "color: #40E0D0"
    static MediumTurquoise = "color: #48D1CC"
    static LightSeaGreen = "color: #20B2AA"
    static DarkCyan = "color: #008B8B"
    static Teal = "color: #008080"
    static Aquamarine = "color: #7FFFD4"
    static MediumAquamarine = "color: #66CDAA"
    static CadetBlue = "color: #5F9EA0"
    static DarkSlateGray = "color: #2F4F4F"
    static MediumSpringGreen = "color: #00FA9A"
    static SpringGreen = "color: #00FF7F"
    static PaleGreen = "color: #98FB98"
    static LightGreen = "color: #90EE90"
    static DarkSeaGreen = "color: #8FBC8F"
    static MediumSeaGreen = "color: #3CB371"
    static SeaGreen = "color: #2E8B57"
    static DarkGreen = "color: #006400"
    static Green = "color: #008000"
    static ForestGreen = "color: #228B22"
    static LimeGreen = "color: #32CD32"
    static Lime = "color: #00FF00"
    static LawnGreen = "color: #7CFC00"
    static Chartreuse = "color: #7FFF00"
    static GreenYellow = "color: #ADFF2F"
    static YellowGreen = "color: #9ACD32"
    static DarkOliveGreen = "color: #556B2F"
    static Olive = "color: #808000"
    static DarkKhaki = "color: #BDB76B"
    static Goldenrod = "color: #DAA520"
    static DarkGoldenrod = "color: #B8860B"
    static SaddleBrown = "color: #8B4513"
    static Sienna = "color: #A0522D"
    static RosyBrown = "color: #BC8F8F"
    static Peru = "color: #CD853F"
    static Chocolate = "color: #D2691E"
    static SandyBrown = "color: #F4A460"
    static NavajoWhite = "color: #FFDEAD"
    static Wheat = "color: #F5DEB3"
    static BurlyWood = "color: #DEB887"
    static Tan = "color: #D2B48C"
    static MediumSlateBlue = "color: #7B68EE"
    static MediumPurple = "color: #9370DB"
    static BlueViolet = "color: #8A2BE2"
    static Indigo = "color: #4B0082"
    static DarkViolet = "color: #9400D3"
    static DarkOrchid = "color: #9932CC"
    static MediumOrchid = "color: #BA55D3"
    static Purple = "color: #A020F0"
    static DarkMagenta = "color: #8B008B"
    static Magenta = "color: #FF00FF"
    static Violet = "color: #EE82EE"
    static Orchid = "color: #DA70D6"
    static Plum = "color: #DDA0DD"
    static MediumVioletRed = "color: #C71585"
    static DeepPink = "color: #FF1493"
    static HotPink = "color: #FF69B4"
    static PaleVioletRed = "color: #DB7093"
    static LightPink = "color: #FFB6C1"
    static Pink = "color: #FFC0CB"
    static LightCoral = "color: #F08080"
    static IndianRed = "color: #CD5C5C"
    static Crimson = "color: #DC143C"
    static Maroon = "color: #800000"
    static DarkRed = "color: #8B0000"
    static FireBrick = "color: #B22222"
    static Brown = "color: #A52A2A"
    static Salmon = "color: #FA8072"
    static DarkSalmon = "color: #E9967A"
    static LightSalmon = "color: #FFA07A"
    static Coral = "color: #FF7F50"
    static Tomato = "color: #FF6347"
    static Red = "color: #FF0000"
    static OrangeRed = "color: #FF4500"
    static DarkOrange = "color: #FF8C00"
    static Orange = "color: #FFA500"
    static Gold = "color: #FFD700"
    static Yellow = "color: #FFFF00"
    static Khaki = "color: #F0E68C"
    static AliceBlue = "color: #F0F8FF"
    static GhostWhite = "color: #F8F8FF"
    static Snow = "color: #FFFAFA"
    static Seashell = "color: #FFF5EE"
    static FloralWhite = "color: #FFFAF0"
    static WhiteSmoke = "color: #F5F5F5"
    static Beige = "color: #F5F5DC"
    static OldLace = "color: #FDF5E6"
    static Ivory = "color: #FFFFF0"
    static Linen = "color: #FAF0E6"
    static Cornsilk = "color: #FFF8DC"
    static AntiqueWhite = "color: #FAEBD7"
    static BlanchedAlmond = "color: #FFEBCD"
    static Bisque = "color: #FFE4C4"
    static LightYellow = "color: #FFFFE0"
    static LemonChiffon = "color: #FFFACD"
    static LightGoldenrodYellow = "color: #FAFAD2"
    static PapayaWhip = "color: #FFEFD5"
    static PeachPuff = "color: #FFDAB9"
    static Moccasin = "color: #FFE4B5"
    static PaleGoldenrod = "color: #EEE8AA"
    static MistyRose = "color: #FFE4E1"
    static LavenderBlush = "color: #FFF0F5"
    static Lavender = "color: #E6E6FA"
    static Thistle = "color: #D8BFD8"
    static Azure = "color: #F0FFFF"
    static LightCyan = "color: #E0FFFF"
    static PowderBlue = "color: #B0E0E6"
    static PaleTurquoise = "color: #E0FFFF"
    static Honeydew = "color: #F0FFF0"
    static MintCream = "color: #F5FFFA"

    /**
     * @param {String} msg mensagem que sera utilizada no log
     * @param {String} cor nome da propriedade cor. exemplo: Log.PaleGreen , caso a opcao seja de uma cor especifica é necessario passar uma string em hexadecimal. exemplo #00FF00
     * @param {bool} corEspecifica parametro opicional para utilizar uma cor especifica no console.log
     * 
     * Exemplo de uma chamada do metodo : Log.color("Mensagem",Log.Red)
     */
    static color(msg, cor, corEspecifica = false) {
        if (!corEspecifica) {
            console.log("%c" + msg, cor)
        } else {
            console.log("%c" + msg, `color: ${cor}`)
        }
    }
}

class Calc {

    /**
    * @param {Object} arrayElements vetor de elementos para calculo do desvio padrao
    *
    * Exemplo de uma chamada do metodo : RetornoDesvioPadrao = Calc.calcDesvioPadrao(VetorDeElementos)
    */

    static calcDesvioPadrao(arrayElements) {

        let numElements = arrayElements.length
        let somaElements = 0
        let calcMedia;

        let somaDividendoDesvioPadrao = 0
        let desvioPadrao

        for (let cont = 0; cont < numElements; cont++) {
            somaElements = somaElements + arrayElements[cont]
        }

        calcMedia = somaElements / numElements

        for (let i = 0; i < numElements; i++) {
            somaDividendoDesvioPadrao = somaDividendoDesvioPadrao + Math.pow((arrayElements[i] - calcMedia), 2)
        }

        desvioPadrao = Math.sqrt((somaDividendoDesvioPadrao / numElements))

        return desvioPadrao
    }
}

```