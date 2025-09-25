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
    static CarregaJson(callback) {
        //aguarda UI ser renderizada (conforto visual)
        setTimeout(() => {
            if (pvi.runInstructionS("rastreamento.getproductcode", []) == "") {
                Log.color("Informações do produto não estão previamente carregadas no PVI", Log.OrangeRed)
                this.requestERP(() => location.reload())
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
        }, 100)
    }

    /**
       * retorna dados do servidor para OP ou numero de serie
       * @param {function} callback 
       * @param {object} config
       */
    static requestERP(callback,
        config = {
            msgPrompt: "Informe o Número de Serie da Peça\nEx [SN]: 1000001234567",
            msgAlert: "Número informado não é um número de série"
        }) {

        const { msgPrompt, msgAlert } = config

        const number = prompt(msgPrompt)

        if (new RegExp(/[1][0-9]{9,12}/).test(number)) {
            sessionStorage.setItem("SerialNumber", number)
            pvi.runInstructionS("rastreamento.setvalidations", ["false", "false", "false", "false"])
            RastPVI.init(number, [], "")
            RastPVI.Monitor((result, msg) => {
                pvi.runInstructionS("rastreamento.setvalidations", ["enabled", "enabled", "enabled", "enabled"])
                if (result) {
                    callback()
                } else {
                    alert(`Não foi possível buscar as informações do número de série ${number} -> ${msg}`)
                    location.reload()
                }
            }, 30000)
        } else {
            alert(msgAlert)
            location.reload()
        }
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