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
            scoreValues : Notifications.getScoresAsArray(),
            boxValues : Notifications.getBoxnamesAsArray()
        }

    }



    componentWillMount() {

    }

    componentDidMount() {
    }
    
    componentWillUnmount() {
    }



    handleOpen = () => {
        this.setState({notificationsDialogOpen: true})
    };

    handleClose = () => {
        if (this.state.scoreValues.length != 0 && this.state.boxValues.length != 0){
            this.setState({notificationsDialogOpen: false})
            Notifications.saveSettings()
        }

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

    boxItems(values){
        return Store.getStore('machines').map((boxName)=>{
        <MenuItem
            key={boxName+'-item'}
            insetChildren={true}
            checked={values && values.indexOf(boxName) > -1}
            value={boxName}
            primaryText={_.capitalize(boxName)}
        />
        })
    }

    handleGradeChange = (event, index, values) => {
        this.setState({scoreValues : values});
        let newGrades = {}
        scores.forEach((score) => {
            newGrades[score] = values.includes(score)
        })
        Notifications
        .setSettings('customSettings', 
        {...Notifications.getSettings().customSettings, grades : newGrades })
    }

    handleBoxChange = (event, index, values) => {
        this.setState({boxValues : values});
        let newBoxes = {}
        Store.getStore('machines').forEach((machine) => {
            newBoxes[machine] = values.includes(machine)
        })
        Notifications.setSettings('customSettings', 
        {...Notifications.getSettings().customSettings, machines : newBoxes })

    }


    render() {
        const notificationDialogActions = [
        <FlatButton
            label="Salvar"
            primary={true}
            onTouchTap={this.handleClose}
        />,
        ];

        const labels = ['Sempre','Frequentemente','De vez em quando','Raramente']

        const items = []
        for (let i = 0; i < labels.length; i++ ) {
        items.push(<MenuItem value={i*3} key={'ev' + i*3} primaryText={labels[i]} />);
        }

        // const houritems = []    
        // houritems.push(<MenuItem value={6} key={'ev6'} primaryText={`nas últimas 6 horas`} />);
        // houritems.push(<MenuItem value={12} key={'e12'} primaryText={`nas últimas 12 horas`} />);
        // houritems.push(<MenuItem value={24} key={'e24'} primaryText={`nas últimas 24 horas`} />);
        // houritems.push(<MenuItem value={48} key={'e48'} primaryText={`nas últimas 48 horas`} />);

        const scoreValues = this.state.scoreValues
        const boxValues = this.state.boxValues

        return (
            <div className='card z-depth-5 main-card' style={{marginTop: 75, marginBottom:100, position: 'relative'}}>
                <h5 className='paper-title valign-wrapper'>
                    <FontIcon className="material-icons" style={{marginRight: 10}}>settings</FontIcon>
                    Configurações 
                </h5>
                <div className='main-card-inner'>


                
                    <div style={{width: 100+'%'}}>

                        
                        {/* NOTIFICATIONS SETTINGS  */}
                        <div className='col s12 m6'>
                            <Paper zDepth={1} className='chart-card-inner'>
                            <div className='paper-title small'>
                            <MenuItem disabled style={{paddingLeft:50,paddingRight:0}} 
                                leftIcon={
                                <FontIcon className="material-icons">notifications</FontIcon>}
                                primaryText={[
                                    <span key='notifications-title' style={{color:'black'}}>Notificações</span>,
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
                            { Notification ? <div style={{padding:15}}>
                                <p> Quando você deseja receber notificações sobre novas avaliações? </p>
                                <RadioButtonGroup 
                                    name="notificationsSelector" 
                                    defaultSelected={Notifications.getSettings().mode}
                                    onChange={ (event,value) => {
                                        Notifications.setSettings('mode',value)
                                        Notifications.saveSettings()} 
                                        }
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
                                    <div style={{ padding:25 }}>
                                        <div className='valign-wrapper'>
                                            Desejo ser informado
                                            <SelectField
                                                maxHeight={300} 
                                                style={{marginBottom:2, marginLeft: 15, width: 210}}
                                                value={this.state.notificationsAmount} 
                                                onChange={(event,key,value) => {
                                                    let newCustomSettings = Notifications.getSettings().customSettings
                                                    newCustomSettings.amount = value
                                                    this.setState({notificationsAmount : value })
                                                    Notifications.setSettings('customSettings',newCustomSettings) } }>
                                                { items }
                                            </SelectField>
                                            {/* { this.state.notificationsAmount !== 'always' 
                                            ? <SelectField 
                                                maxHeight={300}
                                                style={{marginBottom:2,width: 210}}
                                                value={this.state.notificationsPeriod} 
                                                onChange={(event,key,value) => {
                                                    let newCustomSettings = Notifications.getSettings().customSettings
                                                    newCustomSettings.period = value
                                                    this.setState({notificationsPeriod : value })
                                                    Notifications.setSettings('customSettings',newCustomSettings) } }>
                                                { houritems }
                                            </SelectField>
                                            : null } */}
                                        </div>
                                        <div className='valign-wrapper'>
                                            Sobre avaliações com nota
                                            <SelectField
                                                    style={{marginLeft:15}}
                                                    multiple={true}
                                                    hintText="Notas"
                                                    value={scoreValues}
                                                    onChange={this.handleGradeChange}
                                                    errorText={scoreValues.length === 0 ? 'Escolha pelo menos uma nota' : null}
                                                >
                                                    {this.menuItems(scoreValues)}
                                                </SelectField>
                                        </div>

                                        <div className='valign-wrapper'>
                                            Nos locais
                                            <SelectField
                                                    style={{marginLeft:15}}
                                                    multiple={true}
                                                    hintText="Máquinas"
                                                    value={boxValues}
                                                    onChange={this.handleBoxChange}
                                                    errorText={boxValues.length === 0 ? 'Escolha pelo menos uma máquina' : null}
                                                >
                                                    {Store.getStore('machines').map( boxName =>
                                                        <MenuItem
                                                            key={boxName+'-item'}
                                                            insetChildren={true}
                                                            checked={boxValues && boxValues.indexOf(boxName) > -1}
                                                            value={boxName}
                                                            primaryText={_.capitalize(boxName)}
                                                        />
                                                    )
                                                    }
                                                </SelectField>
                                        </div>
                                    </div>
                                    
                    
                                </Dialog>
                            </div>
                        : <p> Notificações não são suportadas nesse navegador,
                            Experimente o Google Chrome ou outro navegador mais moderno 
                        </p>
                        }
                        </Paper>    
                    </div>
                
                {/* END OF NOTIFICATIONS SETTINGS  */}

                </div>


                </div>
            </div>
        );
    }
}


export default Settings;