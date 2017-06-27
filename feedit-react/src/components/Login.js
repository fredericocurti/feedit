import React, { Component } from 'react'
import { login, resetPassword } from '../helpers/auth'

function setErrorMsg(error) {
  return {
    loginMessage: error
  }
}

export default class Login extends Component {
  state = { loginMessage: null }
  handleSubmit = (e) => {
    e.preventDefault()
    login(this.email.value, this.pw.value)
      .catch((error) => {
          this.setState(setErrorMsg('Usuário ou senha inválidos.'))
        })
  }
  resetPassword = () => {
    resetPassword(this.email.value)
      .then(() => this.setState(setErrorMsg(`Um email com instruções para resetar a senha foi enviado para ${this.email.value}.`)))
      .catch((error) => this.setState(setErrorMsg(`Email não cadastrado`)))
  }
  render () {
    return (
      <div>
        <div className="card login" style={{maxWidth:70 + '%', marginTop:3 + "em", padding: 20}}>
          <h5 className="grey-text center"> Faça login </h5>
          <div className="col s12">
            <form onSubmit={this.handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input className="form-control" ref={(email) => this.email = email} placeholder="Digite o seu email"/>
              </div>
              <div className="form-group">
                <label>Senha</label>
                <input type="password" className="form-control" placeholder="Insira sua senha" ref={(pw) => this.pw = pw} />
              </div>
              {
                this.state.loginMessage &&
                <div className="alert alert-danger" role="alert">
                  <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
                  <span className="sr-only"></span>
                  &nbsp;{this.state.loginMessage} <a href="#" onClick={this.resetPassword} className="alert-link">Esqueceu sua senha?</a>
                </div>
              }

              <div className="row center">
                <button type="submit" className="btn red darken-4 waves-effect waves-light"><b>Entrar</b></button>
              </div>
              
              <div className="row center">
                <p className="grey-text text-align center">Ainda não possui uma conta?</p>
              </div>

            </form>
          </div>
        </div>
      </div>
    )
  }
}
