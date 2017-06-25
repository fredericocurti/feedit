import React, { Component } from 'react'
import { Route, BrowserRouter, Link, Redirect, Switch } from 'react-router-dom'
import {Navbar,NavItem,Col,Preloader} from 'react-materialize'
import Login from './Login'
import Register from './Register'
import Dashboard from './protected/Dashboard.jsx'
import { logout } from '../helpers/auth'
import { firebaseAuth } from '../config/constants'

import '../css/materialize.css'

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
    authed: false,
    loading: true,
  }

  componentDidMount () {
    this.removeListener = firebaseAuth().onAuthStateChanged((user) => {
      if (user) {
        console.log(user)
        this.setState({
          authed: true,
          loading: false,
        })
      } else {
        console.log("User is not logged in")
        this.setState({
          authed: false,
          loading: false
        })
      }
    })
  }

  componentWillUnmount () {
    this.removeListener()
  }

  render() {
    return this.state.loading === true ? <div className='row center' style={{marginTop: 25 + '%'}}><Preloader color='red' size='big'/></div> : (
      <BrowserRouter>
        <div>
        <Navbar brand='feedit' href={null} right className='center' style={{backgroundColor:"#FFFFFF"}}>
          <ul>
            <li>
              {this.state.authed
                ? <button
                    style={{border: 'none', background: 'transparent', color: '#000000'}}
                    onClick={() => {
                      logout()
                    }}
                    className="btn">Logout</button>
                : <span>
                    <Link to="/login"></Link>
                  </span>}
            </li>
          </ul>
        </Navbar>
          <div className="container" style={{width : 100 + '%'}}>
              <Switch>
                <Route path='/' exact component={Login} />
                <PublicRoute authed={this.state.authed} path='/login' component={Login} />
                <PrivateRoute authed={this.state.authed} path='/dashboard' component={Dashboard} />
                <Route render={() => <h3>No Match</h3>} />
              </Switch>
          </div>
        </div>
      </BrowserRouter>
    );
  }
}
