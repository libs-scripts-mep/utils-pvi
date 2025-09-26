class UtilsPVI {

    /**
     * Retorna o caminho da pasta do script que está sendo executado, baseado no HTML.
     * @returns string
     */
    static getScriptPath() {
        let pathC = location.pathname.slice(location.pathname.indexOf("C:/"), location.pathname.lastIndexOf("/"))
        let pathI = location.pathname.slice(location.pathname.indexOf("I:/"), location.pathname.lastIndexOf("/"))

        if (pathC.length > 0) {
            return pathC
        } else if (pathI.length > 0) {
            return pathI
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
    static async CarregaJson(callback) {
        if (pvi.runInstructionS("rastreamento.getproductcode", []) == "") {
            Log.color("Informações do produto não estão previamente carregadas", Log.OrangeRed)
            await this.rastInit()
            location.reload()
        } else {
            this.configuraTeste(pvi.runInstructionS("rastreamento.getproductcode", []), (config) => {
                if (config != null) {
                    callback(config)
                } else {
                    window.alert("Arquivo de configuracao nao encontrado (.JSON). Entre em contato com o setor de Metodos e Processos")
                    location.reload()
                }
            })
        }
    }

    static async rastInit() {
        pvi.runInstructionS("rastreamento.setvalidations", ["disabled", "disabled", "disabled", "disabled"])
        const serialNumber = this.getSerialNumber()
        pvi.runInstructionS("ras.init", ["true", serialNumber, []])

        const observer = await this.rastObserver(serialNumber)
        if (!observer.result) {
            alert(`Não foi possível buscar as informações do produto com o número de série '${serialNumber}'!\n\n${observer.info.ResultError}: ${observer.info.Message}`)
            location.reload()
        }
        pvi.runInstructionS("rastreamento.setvalidations", ["enabled", "enabled", "enabled", "enabled"])
    }

    /**@returns {string} */
    static getSerialNumber() {
        const serialNumber = prompt("Informe o número de serie do produto:\nEx: 1000001234567")
        if (serialNumber == null || serialNumber == "") {
            alert("É necessário informar o número de série!")
            location.reload()
        }
        return serialNumber
    }

    /** @returns {Promise<{ result: boolean, info: { ResultError: string, Message: string } }>} */
    static async rastObserver(serialNumber) {
        return new Promise((resolve) => {
            const id = PVI.FWLink.globalDaqMessagesObservers.add((message, param) => {
                if (message.includes(serialNumber)) {
                    const result = param[0]
                    const info = JSON.parse(param[1])

                    if (message.includes("init")) {
                        PVI.FWLink.globalDaqMessagesObservers.remove(id)
                        console.log(`Rastreamento Init ${serialNumber}\n`, result, info)
                        resolve({ result, info })
                    }
                }
            }, "rastreamento")
        })
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

    static OpenJson(path, callback) {
        fetch(path)
            .then((resposta) => {
                console.log(resposta)
                return resposta.json()
            })
            .then((data) => {
                console.log(data)
                callback(data)
            })
            .catch((retornoReject) => {
                alert(retornoReject)
                return false
            })
    }

    /**
     * Solicita ao operador para beepar as etiquetas dos componentes de teste que ele esta utilizando
     * @param {String} RegexComponente regex para validar o valor recebido do prompt 
     * @param {String} Mensagem mensagem a ser exibida para operador no prompt
     * @param {function} callback funcao de retorno
     */
    static SolicitaComponenteDeTeste(RegexComponente, Mensagem, callback) {
        let Componente = prompt(Mensagem)

        try {

            Componente = Componente.match(RegexComponente)

            if (Componente != null) {

                Componente = Componente[0].toUpperCase()
                callback(true, Componente)

            } else {
                callback(false)
            }
        } catch (e) {
            console.log(e.message)
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
        function idUnico() {
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            )
        }

        let id = idUnico()

        pvi.runInstructionS("EXEC", ["cmd.exe", `/c (echo si 1 & echo speed ${speed} & echo r & echo h & echo erase & echo loadfile ${firmware} & echo exit) > %TEMP%/${id}.tmp`, "true", "true"])

        pvi.runInstructionS("EXEC", ["cmd.exe", "/c echo %TEMP%", "true", "true"])
        callback(`${pvi.runInstructionS("getvar", ["_return"])}\\${id}.tmp`)
    }
}