# Utils PVI

Funções auxiliares da infraestrutura de testes (PVI e Effective)

## Instalando

Abra o terminal, e na pasta do script, execute:

```
npm i @libs-scripts-mep/utils-pvi
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
}

```