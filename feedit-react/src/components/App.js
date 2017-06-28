import React, { Component } from 'react'
import { Route, BrowserRouter, Link, Redirect, Switch } from 'react-router-dom'
import {Col,Preloader} from 'react-materialize'
import Navbar from './NavBar'
import Login from './Login'
import Register from './Register'
import Dashboard from './protected/Dashboard.jsx'
import { logout } from '../helpers/auth'
import { firebaseAuth } from '../config/constants'

import '../css/materialize.css'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';


function PrivateRoute ({component: Component, authed, ...rest}) {
  return (
    <Route
      {...rest}
      render={(props) => authed === true
        ? <Component {...props} />
        : <Redirect to={{pathname: '/login', state: {from: props.location}}} />}
    />
  )
}

function PublicRoute ({component: Component, authed, ...rest}) {
  return (
    <Route
      {...rest}
      render={(props) => authed === false
        ? <Component {...props} />
        : <Redirect to='/dashboard' />}
    />
  )
}

export default class App extends Component {
  state = {
    loading: true,
    user: null,
    authed: false,
  }


  componentDidMount () {
    this.removeListener = firebaseAuth().onAuthStateChanged((user) => {
      if (user) {
        console.log('User signed in',user)
        this.setState({
          authed: true,
          loading: false,
          user: user,
        })
      } else {
        console.log("User is not logged in/signed out")
        this.setState({
          authed: false,
          loading: false,
          user : null
        })
      }
    })
  }

  componentWillUnmount () {
    this.removeListener()
  }

  render() {
    var navChildren = [
            <div>
              {this.state.authed
                ? <button
                    style={{border: 'none', background: 'white', color: '#000000'}}
                    onClick={() => {
                      logout()
                    }}
                    className="btn">Logout</button>
                : <span>
                    <Link to="/login"></Link>
                  </span>}
            </div> ]

    return this.state.loading === true ? <div className='row center' style={{marginTop: 25 + '%'}}><Preloader color='red'/></div> : (
      <BrowserRouter>
        <MuiThemeProvider>
        <div style={{height: 100 + '%'}}>
          { this.state.authed 
            ?  <Navbar href={null} user={this.state.user} children={navChildren}/> 
          : null}

          <div style={{height: 100 + '%',overflowY: 'auto'}}>
              <Switch>
                <Route path='/' exact component={Login} />
                <PublicRoute authed={this.state.authed} path='/login' component={Login} />
                <PrivateRoute authed={this.state.authed} path='/dashboard' component={Dashboard} />
                <Route render={() => <h3>No Match</h3>} />
              </Switch>
          </div>
        </div>
        </MuiThemeProvider>
      </BrowserRouter>
    );
  }
}
