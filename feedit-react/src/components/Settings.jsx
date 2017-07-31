import React, { Component } from 'react';
import Paper from 'material-ui/Paper'
import FontIcon from 'material-ui/FontIcon';
import MenuItem from 'material-ui/MenuItem'
import Toggle from 'material-ui/Toggle';
import ActionFavorite from 'material-ui/svg-icons/action/favorite';
import ActionFavoriteBorder from 'material-ui/svg-icons/action/favorite-border';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';
import DropDownMenu from 'material-ui/DropDownMenu';
import SelectField from 'material-ui/SelectField';
import Notifications from '../helpers/notifications.js'
import Store from '../helpers/store.js'
import _ from 'lodash'

const styles = {
  block: {
    maxWidth: 250,
  },
  radioButton: {
    marginBottom: 16,
  },
};

const scores = ['excelente','bom','ruim']

class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            notificationsDialogOpen : false,
            notificationsAmount: Notifications.getSettings().customSettings.amount,
            notificationsPeriod : Notifications.getSettings().customSettings.period,
            scoreValues : Notifications.getScoresAsArray()
        }

    }



    componentWillMount() {

    }

    componentDidMount() {
    }
    
    componentWillUnmount() {
    }



    handleOpen = () => {
        this.setState({notificationsDialogOpen: true});
    };

    handleClose = () => {
        this.setState({notificationsDialogOpen: false});
        Notifications.saveSettings()
    };

    menuItems(values) {
        return scores.map((score) => (
        <MenuItem
            key={score}
            insetChildren={true}
            checked={values && values.indexOf(score) > -1}
            value={score}
            primaryText={_.capitalize(score)}
        />
        ));
    }

    handleChange = (event, index, values) => {
        this.setState({scoreValues : values});
        let newGrades = {}
        scores.forEach((score) => {
            newGrades[score] = values.includes(score)
        })
        console.log()
        Notifications.setSettings('customSettings', 
        {...Notifications.getSettings().customSettings, grades : newGrades })

    }


    render() {
        const notificationDialogActions = [
        <FlatButton
            label="Salvar"
            primary={true}
            onTouchTap={this.handleClose}
        />,
        ];

        const items = []
        items[0] =  <MenuItem value={'always'} key={'evalways'} primaryText={`sempre`} />
        for (let i = 5; i <= 25; i+= 5 ) {
        items.push(<MenuItem value={i} key={'ev' + i} primaryText={`a cada ${i} Avaliações`} />);
        }

        const houritems = []    
        houritems.push(<MenuItem value={6} key={'ev6'} primaryText={`nas últimas 6 horas`} />);
        houritems.push(<MenuItem value={12} key={'e12'} primaryText={`nas últimas 12 horas`} />);
        houritems.push(<MenuItem value={24} key={'e24'} primaryText={`nas últimas 24 horas`} />);
        houritems.push(<MenuItem value={48} key={'e48'} primaryText={`nas últimas 48 horas`} />);

        const scoreValues = this.state.scoreValues

        return (
            <div className='card z-depth-5' style={{marginTop: 75, marginBottom:100, position: 'relative', zIndex : 10}}>
                <h5 className='paper-title valign-wrapper'>
                    <FontIcon className="material-icons" style={{marginRight: 10}}>settings</FontIcon>
                    Configurações 
                </h5>
                
                <div className='row'>

                    
            {/* NOTIFICATIONS SETTINGS  */}

                    <div className='col s12 m6' style={{padding: 50}}>
                        <Paper zDepth={1} className='chart-card-inner'>
                        <div className='paper-title small'>
                        <MenuItem disabled style={{paddingLeft:50,paddingRight:0}} 
                            leftIcon={
                            <FontIcon className="material-icons">notifications</FontIcon>}
                            primaryText={[
                                <span key='notifcations-title' style={{color:'black'}}>Notificações</span>,
                                <Toggle key='notifications-toggle' 
                                        defaultToggled={Notifications.getSettings().enabled}
                                        onToggle={ (event,isInputChecked) => {
                                            Notifications.setSettings('enabled',isInputChecked)
                                            Notifications.saveSettings()
                                            }}
                                        style={{display:'inline-block',float:'right',width:'auto',padding:'13.5px 20px 0 0'}}
                                />
                            ]}
                        />

                        </div>
                        <div style={{padding:15}}>
                            <p> Quando você deseja receber notificações sobre novas avaliações? </p>
                            <RadioButtonGroup 
                                name="notificationsSelector" 
                                defaultSelected={Notifications.getSettings().mode}
                                onChange={ (event,value) => Notifications.setSettings('mode',value) }
                            >
                            <RadioButton
                                value="always"
                                label="Sempre"
                                style={styles.radioButton}
                            />
                            <RadioButton
                                value="custom"
                                label="Personalizado"
                                style={styles.radioButton}
                                onClick={ ()=> {
                                    this.setState({
                                        notificationsDialogOpen : !this.state.notificationsDialogOpen
                                    })} 
                                }
                            />

                            <RadioButton
                                value="auto"
                                label="Automaticamente - Por nossa conta ;) "
                                style={styles.radioButton}
                            />
                            </RadioButtonGroup>

                            <Dialog
                                title="Personalize suas notificações"
                                actions={notificationDialogActions}
                                modal={true}
                                open={this.state.notificationsDialogOpen}
                            >
                                <div className='valign-wrapper'>
                                    Desejo ser informado
                                    <DropDownMenu 
                                        maxHeight={300} 
                                        style={{marginBottom:10}}
                                        value={this.state.notificationsAmount} 
                                        onChange={(event,key,value) => {
                                            let newCustomSettings = Notifications.getSettings().customSettings
                                            newCustomSettings.amount = value
                                            this.setState({notificationsAmount : value })
                                            Notifications.setSettings('customSettings',newCustomSettings) } }>
                                        { items }
                                    </DropDownMenu>
                                    { this.state.notificationsAmount !== 'always' 
                                    ? <DropDownMenu 
                                        maxHeight={300}
                                        style={{marginBottom:10}}
                                        value={this.state.notificationsPeriod} 
                                        onChange={(event,key,value) => {
                                            let newCustomSettings = Notifications.getSettings().customSettings
                                            newCustomSettings.period = value
                                            this.setState({notificationsPeriod : value })
                                            Notifications.setSettings('customSettings',newCustomSettings) } }>
                                        { houritems }
                                    </DropDownMenu>
                                    : null }
                                </div>

                                 <SelectField
                                    multiple={true}
                                    hintText="Notas"
                                    value={scoreValues}
                                    onChange={this.handleChange}
                                >
                                    {this.menuItems(scoreValues)}
                                </SelectField>


                                {/* { scores.map( value => 
                                    <Checkbox
                                        label={_.capitalize(value)}
                                        style={styles.checkbox}
                                        defaultChecked={Notifications.getSettings().customSettings.scores[value]}
                                        onCheck={ (event,isInputChecked) => {
                                                    let newCustomSettings = Notifications.getSettings().customSettings
                                                    newCustomSettings.scores[value] = isInputChecked
                                                    Notifications
                                                    .setSettings('customSettings',newCustomSettings)
                                        } }
                                    />
                                    
                                    <MenuItem
                                        key={value}
                                        insetChildren={true}
                                        checked={this.state.scoreValues}
                                        value={name}
                                        primaryText={_.capitalize(value)}
                                    />


                                ) } */}
                                

                                 Nos Locais
                                { Store.getStore('machines').map( (boxName) => {
                                    return <Checkbox
                                        label={_.capitalize(boxName)}
                                        style={styles.checkbox}
                                        defaultChecked={ Notifications.getSettings().customSettings.machines[boxName] }
                                        onCheck={ (event,isInputChecked) => {
                                                let newCustomSettings = Notifications.getSettings().customSettings
                                                newCustomSettings.machines[boxName] = isInputChecked
                                                Notifications
                                                .setSettings('customSettings',newCustomSettings)
                                            }
                                        }
                                    />
                                })

                                }
 
                            </Dialog>



                        </div>
                    </Paper>    
                    </div>
            
            {/* END OF NOTIFICATIONS SETTINGS  */}




                </div>
            </div>
        );
    }
}


export default Settings;