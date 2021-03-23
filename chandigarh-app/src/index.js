import React from 'react';
import ReactDOM from 'react-dom';
import chandyData from './ChandyData';
import {Table} from 'antd';
import Text from 'react-texty';

import 'antd/dist/antd.css'
import 'react-texty/styles.css'

class ChandyTable extends React.Component {
    constructor(props) {
        super(props)
        this.columns = []
        this.dataSource = []
    }


    

    createTable() {
        this.columns = Object.keys(chandyData[0]).map((keyName, keyIndex) => {
            const column = 
                {
                    key: keyIndex,
                    title: keyName,
                    dataIndex: keyName,
                    ellipsis: true,
                };
            return column;
        })
    }

    render() {
        const header = "Chair Data";
        this.createTable();
        console.log(this.columns);

        // Adding some tooltips for any data that does not fully display
        const TableCell = ({ className, cellData }) => (
            <Text className={className}>{cellData}</Text>
        )
        const TableHeaderCell = ({ className, column }) => (
            <Text className={className}>{column.title}</Text>
        )

        return (
            <div>
                <div className="header">{header}</div>
                <div>
                    <Table dataSource={chandyData} rowKey={(x) => x.Link} columns={this.columns} components={{ TableCell, TableHeaderCell }} />
                </div>
            </div>
        )
    }
}

class ChairData extends React.Component {
    render()
    {
        return (
            <div className="chairs">
                <ChandyTable />
            </div>
        );
    }
}

ReactDOM.render(
    <ChairData />,
    document.getElementById('root')
);