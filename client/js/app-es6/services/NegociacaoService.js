import {HttpService} from './HttpService';
import {ConnectionFactory} from './ConnectionFactory';
import {NegociacaoDao} from '../dao/NegociacaoDao';
import {Negociacao} from '../models/Negociacao';

export class NegociacaoService {
    
    constructor() {
        this._http = new HttpService();
    }
    
    obterNegociacoesDaSemana() {               
        return this._http
            .get('negociacoes/semana')
            .then(negociacoes => {                
                return negociacoes.map(objeto => new Negociacao(new Date(objeto.data), objeto.quantidade, objeto.valor));
            })
            .catch(erro => {
                console.error(erro);
                throw new Error('Não foi possível obter as negociações da semana');
            });  
    }
    
    obterNegociacoesDaSemanaAnterior() {               
        return this._http
            .get('negociacoes/anterior')
            .then(negociacoes => {
                return negociacoes.map(objeto => new Negociacao(new Date(objeto.data), objeto.quantidade, objeto.valor));
            })
            .catch(erro => {
                console.error(erro);
                throw new Error('Não foi possível obter as negociações da semana anterior');
            });   
    }
    
    obterNegociacoesDaSemanaRetrasada() {
               
        return this._http
            .get('negociacoes/retrasada')
            .then(negociacoes => {                
                return negociacoes.map(objeto => new Negociacao(new Date(objeto.data), objeto.quantidade, objeto.valor));
            })
            .catch(erro => {
                console.error(erro);
                throw new Error('Não foi possível obter as negociações da semana retrasada');
            });  
        
    }
    
    obterNegociacoes() {
        
        return Promise.all([
            this.obterNegociacoesDaSemana(),
            this.obterNegociacoesDaSemanaAnterior(),
            this.obterNegociacoesDaSemanaRetrasada()
        ]).then(periodos => {

            let negociacoes = periodos
                .reduce((dados, periodo) => dados.concat(periodo), [])
                .map(dado => new Negociacao(new Date(dado.data), dado.quantidade, dado.valor ));

            return negociacoes;
        }).catch(erro => {
            throw new Error(erro);
        });
    } 
    
    cadastra(negociacao){
        return ConnectionFactory
            .getConnection()
            .then(connection =>new NegociacaoDao(connection))
            .then(dao=>dao.adiciona(negociacao))             
            .then(()=>"Negociação adicionada com sucesso")       
            .catch(erro=>{
                console.error(erro)
                throw new Error('Não foi possivel adicinar a negociação');
            })
    }
  

    lista(){        
        return ConnectionFactory
                .getConnection()
                .then(connection => new NegociacaoDao(connection))
                .then(dao => dao.listaTodos())
                .catch(erro=>{
                    console.erro(erro)
                    throw new Error('Erro ao imporatar as negociações');
                });
    }


    apaga(){
        return ConnectionFactory
                .getConnection()
                .then(connection => new NegociacaoDao(connection))
                .then(dao => dao.apagaTodos())
                .catch((erro)=>{
                    console.log(erro);
                    throw new Error("Não foi possivel apagar a negocioção");
                })
             
    }

    importa(listaAtual){       
            return this.obterNegociacoes()
                .then(negociacoes=>negociacoes
                    .filter(negociacao=>
                        !listaAtual.some(negociacaoExistente=>
                                negociacaoExistente.isEquals(negociacao)
                            )                    
                        )
                ).catch(erro=>{
                    console.error(erro);
                    throw new Error(erro); 
                })


    }
}
