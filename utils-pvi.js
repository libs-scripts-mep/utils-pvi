class UtilsPVI {

    /**
     * Retorna o caminho da pasta do script que está sendo executado, baseado no HTML.
     * @returns string
     */
    static getScriptPath() {
        return location.pathname.slice(location.pathname.indexOf("C:/"), location.pathname.lastIndexOf("/"))
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

        //aguarda UI ser renderizada (conforto visual)
        setTimeout(() => {

            if (isNaN(parseInt(sessionStorage.getItem("ProductCode")))) {

                this.requestERP((dataErp) => {

                    if (dataErp != null) {

                        sessionStorage.setItem("RequisicaoInicialERP", dataErp)

                        let ERPDataUnparsed = sessionStorage.getItem("RequisicaoInicialERP")
                        let ERPDataParsed = JSON.parse(ERPDataUnparsed)

                        if (ERPDataParsed.hasOwnProperty("Information")) {
                            //Caso for passado um número de serie para configuracao
                            sessionStorage.setItem("ProductCode", ERPDataParsed.Information.ProductCode)
                            sessionStorage.setItem("SerialNumber", ERPDataParsed.Code)
                        } else if (ERPDataParsed.hasOwnProperty("Product")) {
                            //Caso for passado um número de uma OP para configuracao
                            sessionStorage.setItem("ProductCode", ERPDataParsed.Product.ProductCode)
                        } else {
                            window.alert("Objeto retornado do ERP e invalido!")
                            location.reload()
                        }

                        this.configuraTeste(sessionStorage.getItem("ProductCode"), (config) => {
                            if (config != null) {
                                callback(config)
                            } else {
                                window.alert("Arquivo de configuracao nao encontrado (.JSON). Entre em contato com o setor de Metodos e Processos")
                                location.reload()
                            }
                        })

                    } else {
                        location.reload()
                    }
                })

            } else {
                this.configuraTeste(sessionStorage.getItem("ProductCode"), (config) => {
                    if (config != null) {
                        callback(config)
                    } else {
                        window.alert("Arquivo de configuracao nao encontrado (.JSON). Entre em contato com o setor de Metodos e Processos")
                        location.reload()
                    }
                })
            }
        }, 100)
    }

    /**
     * retorna dados do servidor para OP ou numero de serie
     * @param {function} callback 
     */
    static requestERP(callback) {

        let number = prompt("Informe o Número de Serie da Peca ou OP do Lote.\nEx [OP]: OP-123456-1\nEx [SN]: 1000001234567")
        let httpReq = new XMLHttpRequest()
        let URL = null

        if (number != null) {
            if (number.toString().match(/[1][0][0][0][0][0-9]{8}/) != null) {
                URL = "http://rast.inova.ind.br/api/effective/products/" + number.toString()
            } else if (number.match(/[o|O][p|P][a-zA-Z]?[a-zA-Z]?[[a-zA-Z]?[-][0-9]{1,7}[-][0-1]/) != null) {
                URL = "http://rast.inova.ind.br/api/effective/orders/0/" + number.toString()
            } else {
                window.alert("Número informado nao e nem um número de serie, nem uma OP")
                location.reload()
            }
        } else {
            window.alert("Número informado nao informado.")
            location.reload()
        }

        httpReq.onreadystatechange = function () {

            if (httpReq.readyState == 4 && httpReq.status == 200) {

                callback(httpReq.responseText)
                console.log("requisicao HTTP: " + httpReq.statusText)

            } else if (httpReq.status.toString().match(/[3-5][0-9]{2}/) != null) {
                callback(null)
            }
        }

        httpReq.open("GET", URL, true)
        httpReq.send()
    }

    /**
     * carrega as configuracoes do produto atraves do arquivo Json 
     * @param {number} codigo codigo do produto
     * @param {function} callback funcao de retorno 
     */
    static configuraTeste(codigo, callback) {

        let toConfigTest = setTimeout(() => {
            callback(null)
        }, 1000)

        if (!isNaN(codigo)) {

            try {
                fetch("Produtos/" + codigo + ".json")
                    .then(response => response.json())
                    .then((json) => {
                        clearTimeout(toConfigTest)
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
}

