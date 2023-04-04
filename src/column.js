import React from "react";
import {Droppable} from "react-beautiful-dnd";
import Task from "./task";
import './App.css'

const COLUMN_ID_DONE = "done"
export default class Column extends React.Component {
    render() {
        return (
            <div style={{margin: '8px', border: '1px solid lightgrey', borderRadius: '2px'}}>
                <h3 style={{padding: '8px'}}>{this.props.column.title}</h3>
                <Droppable
                        droppableId={this.props.column.id}
                >
                    {(provided, snapshot) => (
                        <div style={{padding: '8px'}}
                            ref={provided.innerRef}
                             {...provided.droppableProps}
                        >
                            {this.props.tasks.map((task, index) => <Task key={task.id} task={task} index={index} changeSelectedTaskIds={this.props.changeSelectedTaskIds} initialData={this.props.initialData} selectedTaskIds={this.props.selectedTaskIds}/>)}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </div>
        )
    }
}