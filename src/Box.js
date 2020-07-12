import React from 'react';
import axios from 'axios';
import { Chart } from "react-google-charts";
import { Grid, Container, Table, Label, Header } from 'semantic-ui-react';


class Info extends React.Component {
    state = {
        geneName: '',
        isLoading: true,
        downExp: [],
        upExp: [],
        annot: [],
        sample1: '',
        sample2: ''
    };

    // sort array ascending
    asc = arr => arr.sort((a, b) => a - b);

    sum = arr => arr.reduce((a, b) => a + b, 0);

    mean = arr => this.sum(arr) / arr.length;

    // sample standard deviation
    std = (arr) => {
        const mu = this.mean(arr);
        const diffArr = arr.map(a => (a - mu) ** 2);
        return Math.sqrt(this.sum(diffArr) / (arr.length - 1));
    };

    quantile = (arr, q) => {
        const sorted = this.asc(arr);
        const pos = (sorted.length - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;
        if (sorted[base + 1] !== undefined) {
            return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
        } else {
            return sorted[base];
        }
    };

    callExp = async (geneName) => {

        if (geneName !== "Too many results") {
            console.log("targetGene:", geneName)
            try {
                const { data: { 0: { exp1 } } } = await axios.get(`http://203.255.24.99:3007/exp1/?format=json&geneName=${geneName}`)
                const { data: { 0: { exp2 } } } = await axios.get(`http://203.255.24.99:3007/exp2/?format=json&geneName=${geneName}`)
                const { data } = await axios.get(`http://203.255.24.99:3007/annot/?format=json&geneName=${geneName}`)
                const sampleName1 = await axios.get(`http://203.255.24.99:3007/exp1/?format=json&geneName=samples`)
                const sampleName2 = await axios.get(`http://203.255.24.99:3007/exp2/?format=json&geneName=samples`)
                this.setState({ isLoading: false, downExp: exp1, upExp: exp2, annot: data, geneName: geneName, sample1: sampleName1.data[0].exp1, sample2: sampleName2.data[0].exp2 })
            }
            catch{
                //pass
            }

        }
        else {
            console.log('pass')
            //pass
        }

    }

    componentDidUpdate(prevProps, prevState) {
        console.log('didupdate1')
        console.log('#', prevProps)
        console.log('#', this.props)
        const { location, history } = this.props;
        //console.log(location.state.foodCd,prevLocation.state.foodCd)
        if (location !== prevProps.location) { // 이게 없으면 무한반복함. 같은 페이지의 어떤 움직임도 다 업뎃으로 인식하나봄. 
            if (location.state === undefined) {
                history.push("/");
            }
            else {
                const { location: { state: { geneName } } } = this.props
                console.log(geneName)
                this.callExp(geneName)
            }
        }
    }

    get_exp2data = (array, color, initial) => {
        return array.map((each, ix) => ([initial + ix, each, color, null]))
    }

    get_exp2data_v2 = (array, color, samplenames) => {
        return array.map((each, ix) => ([samplenames[ix] + ix, each, color, null]))
    }

    componentDidMount() {
        const { history } = this.props;
        const { location: { state } } = this.props;
        if (state === undefined) {
            history.push("/");
        }
        else {
            const { location: { state: { geneName } } } = this.props
            console.log(geneName)
            this.callExp(geneName)
        }
    }
    render() {
        const { geneName, isLoading, downExp, upExp, annot, sample1, sample2 } = this.state;
        var upExpArray2chart = []
        var dwExpArray2chart = []
        if (isLoading === false) {
            console.log('sample1', sample1, sample2)
            var upExpArray = upExp.toString().split(",").map(parseFloat)
            const dwExpArray = downExp.toString().split(",").map(parseFloat)
            upExpArray2chart = this.get_exp2data_v2(upExpArray, 'green', sample2.toString().split(","))
            dwExpArray2chart = this.get_exp2data_v2(dwExpArray, 'blue', sample1.toString().split(","))
            const upLabel = ['sarco']
            const downLabel = ['non-sarco']
            var upData = upLabel.concat([Math.min(...upExpArray), this.quantile(upExpArray, 0.25), this.quantile(upExpArray, 0.75), Math.max(...upExpArray)])
            upData = upData.concat(['color:green'])
            var downData = downLabel.concat([Math.min(...dwExpArray), this.quantile(dwExpArray, 0.25), this.quantile(dwExpArray, 0.75), Math.max(...dwExpArray)])
            downData = downData.concat(['color:blue'])
        }


        // const upData = upLabel.concat([Math.min(...upExpArray), upBox.quartile1, upBox.quartile3, Math.max(...upExpArray)])
        // const downData = downLabel.concat([Math.min(...downExpArray), dwBox.quartile1, dwBox.quartile3, Math.max(...downExpArray)])
        return (

            <div>
                {isLoading ? "Loading" :
                    <Container>
                        <Grid stackable columns={2}>
                            <Grid.Column width={8}>
                                <Chart
                                    width={'100%'}
                                    height={350}
                                    chartType="CandlestickChart"
                                    loader={<div>Loading Chart</div>}
                                    data={[
                                        ['phase', 'a', 'b', 'c', 'd', { role: "style" }],
                                        downData,
                                        upData,
                                    ]}
                                    options={{
                                        title: "Box plot of gene expression",
                                        bar: { groupWidth: '60%' },
                                        legend: 'none',
                                        seriesType: 'candlesticks',
                                        vAxis: { title: 'TPM', titleTextStyle: { italic: false } },
                                    }}
                                    rootProps={{ 'data-testid': '1' }}
                                />
                            </Grid.Column>
                            <Grid.Column width={8}>
                                <Chart
                                    width={'100%'}
                                    height={350}
                                    chartType="ColumnChart"
                                    loader={<div>Loading Chart</div>}
                                    data={[
                                        [
                                            'Element',
                                            'Density',
                                            { role: 'style' },
                                            {
                                                sourceColumn: 0,
                                                role: 'annotation',
                                                type: 'string',
                                                calc: 'stringify',
                                            },
                                        ],
                                        ...dwExpArray2chart,
                                        ...upExpArray2chart,

                                    ]}

                                    options={{
                                        title: 'Bar plot of gene expressions',
                                        bar: { groupWidth: '60%' },
                                        legend: { position: 'none' },
                                        hAxis: {
                                            title: 'Samples',
                                            titleTextStyle: { italic: false }
                                        },
                                        vAxis: {
                                            title: 'TPM',
                                            titleTextStyle: { italic: false }
                                        },
                                    }}
                                    // For tests
                                    rootProps={{ 'data-testid': '6' }}
                                />
                            </Grid.Column>
                            <Grid.Column width={16}>
                                <Header textAlign='center'> {geneName} information based on Ensembl (http://asia.ensembl.org/Homo_sapiens/Info/Index) DB </Header>
                                <Table centered>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell>Class</Table.HeaderCell>
                                            <Table.HeaderCell>Information</Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        <Table.Row>
                                            <Table.Cell>GeneID</Table.Cell>
                                            <Table.Cell>{annot[0].geneName}</Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.Cell>GeneName</Table.Cell>
                                            <Table.Cell>{annot[0].geneSearch}</Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.Cell>Annotation</Table.Cell>
                                            <Table.Cell>{annot[0].geneDesc}</Table.Cell>
                                        </Table.Row>
                                    </Table.Body>
                                </Table>
                            </Grid.Column>
                        </Grid>
                    </Container>
                }
            </div>



        )
    }
}

export default Info;
