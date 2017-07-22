import React, { Component } from 'react'
import Radium, { StyleRoot } from 'radium'
import Containers from 'js/containers'
import _ from 'lodash'
import {
    Button,
    Progress,
    Input,
    Form
} from 'semantic-ui-react'
import {
    MdAttachMoney
} from 'react-icons/lib/md'

@Radium
class App extends Component {
    constructor (props) {
        super(props)
        this.reset = this.reset.bind(this)
        this.start = this.start.bind(this)
        this.update = this.update.bind(this)
        this.onChange = this.onChange.bind(this)
        this.groupOnChange = this.groupOnChange.bind(this)
        this.addGroup = this.addGroup.bind(this)
        this.deleteGroup = this.deleteGroup.bind(this)
        this.toggleAllowNegativeMoney = this.toggleAllowNegativeMoney.bind(this)
        this.state = {
            status: 'stop',
            round: 0,
            totalRound: 17000,
            batchRound: 100,
            data: [],
            allowNegativeMoney: false,
            groups: [{
                color: '#657b5b',
                num: 100,
                money: 100,
                reward: 1.0
            }]
        }
    }
    reset () {
        const { groups } = this.state
        const data = _.concat(..._.map(groups, (group) => (
            _.range(group.num).map(() => ({
                money: group.money,
                color: group.color,
                reward: group.reward
            }))
        )))
        this.setState({
            round: 0,
            status: 'stop',
            data: data
        })
    }
    start () {
        this.reset()
        this.setState({
            status: 'run'
        })
        this.update()
    }
    update () {
        window.requestAnimationFrame(() => {
            if (this.state.status !== 'run') {
                return
            }
            if (this.state.round >= this.state.totalRound) {
                return
            }
            let data = _.cloneDeep(this.state.data)
            let randomRange = data.length - 1
            for (let i = 0; i < this.state.batchRound; i++) {
                _.each(data, (datum, id) => {
                    if (datum.money <= 0 && !this.state.allowNegativeMoney) {
                        return
                    }
                    datum.money -= 1
                    let given = _.random(randomRange)
                    data[given].money += 1 * data[given].reward
                })
            }
            data = _.sortBy(data, (datum) => { return datum.money })
            this.setState({
                round: this.state.round + this.state.batchRound,
                data: data
            })
            this.update()
        })
    }
    onChange (event) {
        this.setState({
            [event.target.name]: event.target.value
        })
    }
    groupOnChange (id, event) {
        const groups = this.state.groups
        groups[id] = {
            ...groups[id],
            [event.target.name]: event.target.name === 'color' ? event.target.value : parseFloat(event.target.value)
        }
        this.setState({
            groups
        })
    }
    addGroup () {
        this.setState({
            groups: [
                ...this.state.groups,
                {
                    color: '#657b5b',
                    num: 100,
                    money: 100,
                    reward: 1.0
                }
            ]
        })
    }

    deleteGroup (id) {
        const groups = this.state.groups
        groups.splice(id, 1)
        this.setState({
            groups
        })
    }
    toggleAllowNegativeMoney () {
        this.setState({
            allowNegativeMoney: !this.state.allowNegativeMoney
        })
    }
    componentDidMount () {
        var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame
        window.requestAnimationFrame = requestAnimationFrame
        this.reset()
    }
    render () {
        const { data } = this.state
        let chartData = {
            columns: [
                ['', ..._.map(data, (datum) => (datum.money))]
            ],
            color: (color, d) => {
                if (d) {
                    return data[d.index].color
                }
                return 'white'
            },
            grid: {
                y: {
                    lines: [{
                        value: 0
                    }]
                }
            },
            type: 'bar'
        }
        return (
            <StyleRoot>
                <div>
                    <div
                        style={{
                            width: '100vw',
                            height: '100vh',
                            backgroundColor: 'black',
                            color: 'white',
                            textAlign: 'center'
                        }}>
                        <div
                            style={{
                                padding: '0% 20%',
                                fontSize: '28px',
                                lineHeight: '32px',
                                height: '100%',
                                flexDirection: 'column',
                                display: 'flex',
                                justifyContent: 'center'
                            }}>
                            <div>
                                <MdAttachMoney
                                    style={{
                                        fontSize: '256px'
                                    }}
                                    />
                            </div>
                            房間內有 100 個人，每個人有 100 元，每分鐘隨機給另一個人一元，最後這個房間內的財富分佈是怎樣的？
                        </div>

                    </div>
                    <div
                        style={{
                            width: '80vw',
                            margin: '10vw'
                        }}>
                        <div>
                            <div id="testchart"></div>
                            <Containers.C3
                                data={chartData}
                                element='testchart'
                                />
                        </div>
                        <div>
                            <Progress percent={parseInt(100 * this.state.round / this.state.totalRound)} progress />
                            <div
                                style={{
                                    marginBottom: '18px'
                                }}>
                                <Button disabled={this.state.status === 'stop'} onClick={this.reset}>Reset</Button>
                                <Button disabled={this.state.status === 'run'} onClick={this.start}>Start</Button>
                            </div>
                            <Form
                                style={{
                                    marginBottom: '18px'
                                }}>
                                <Form.Field inline>
                                    <label>交換次數</label>
                                    <Input type='number' name='totalRound' value={this.state.totalRound} onChange={this.onChange} />
                                </Form.Field>
                                <Form.Field inline>
                                    <label>允許負債</label>
                                    <Button toggle active={this.state.allowNegativeMoney} onClick={this.toggleAllowNegativeMoney}>
                                        { this.state.allowNegativeMoney ? '是' : '否' }
                                    </Button>
                                </Form.Field>
                            </Form>
                            <div>
                                <Form>
                                {
                                    _.map(this.state.groups, (group, groupId) => (
                                        <Form.Group inline key={groupId}>
                                            <Form.Field>
                                                <label>數量</label>
                                                <Input type='number' name='num' value={group.num} onChange={(e) => this.groupOnChange(groupId, e)} />
                                            </Form.Field>
                                            <Form.Field>
                                                <label>初始金錢</label>
                                                <Input type='number' name='money' value={group.money} onChange={(e) => this.groupOnChange(groupId, e)} />
                                            </Form.Field>
                                            <Form.Field>
                                                <label>獎勵倍數</label>
                                                <Input type='number' name='reward' value={group.reward} onChange={(e) => this.groupOnChange(groupId, e)} />
                                            </Form.Field>
                                            <Form.Field>
                                                <label>顏色</label>
                                                <Input type='text' name='color' value={group.color} onChange={(e) => this.groupOnChange(groupId, e)} />
                                            </Form.Field>
                                            <Button negative onClick={() => this.deleteGroup(groupId)}>移除</Button>
                                        </Form.Group>
                                    ))
                                }
                                </Form>
                            </div>
                            <Button positive onClick={this.addGroup}>新增群組</Button>
                        </div>
                    </div>
                </div>
            </StyleRoot>
        )
    }
}

export default App
