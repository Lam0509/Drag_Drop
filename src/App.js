import React from "react";
import './App.css';
import {DragDropContext} from "react-beautiful-dnd";
import Column from "./column";
import {buildQueries} from "@testing-library/react";

const initialData = {
    tasks: {
        'task-1': {id: 'task-1', content: "Take out the garbage"},
        'task-2': {id: 'task-2', content: "Watch my favorite show"},
        'task-3': {id: 'task-3', content: "Charge my phone"},
        'task-4': {id: 'task-4', content: "Cook dinner"},
        'task-5': {id: 'task-5', content: "New Task"},
        'task-6': {id: 'task-6', content: "New Task"},
        'task-7': {id: 'task-7', content: "New Task"},
        'task-8': {id: 'task-8', content: "New Task"},
        'task-9': {id: 'task-9', content: "New Task"},
        'task-10': {id: 'task-10', content: "New Task"},
    },
    columnIds: ['column-1'],
    columns: {
        'column-1': {
            id: 'column-1',
            title: 'To do',
            taskIds: ['task-1', 'task-2', 'task-3', 'task-4', 'task-5', 'task-6', 'task-7', 'task-8', 'task-9', 'task-10']
        }
    },
    columnOrder: ['column-1']
}

const getHomeColumn = (entities, taskId) => {
    return entities.columns['column-1'];
};

const withNewTaskIds = (column, taskIds) => ({
    id: column.id,
    title: column.title,
    taskIds
});

const reorderMultiDrag = ({
                              entities,
                              selectedTaskIds,
                              source,
                              destination
                          }) => {
    const start = entities.columns[source.droppableId];
    const dragged = start.taskIds[source.index];

    const insertAtIndex = (() => {
        const destinationIndexOffset = selectedTaskIds.reduce(
            (previous, current) => {
                if (current === dragged) {
                    console.log(previous)
                    return previous;
                }

                const final = entities.columns[destination.droppableId];
                const column = getHomeColumn(entities, current);

                if (column !== final) {
                    return previous;
                }

                const index = column.taskIds.indexOf(current);

                if (index >= destination.index) {
                    return previous;
                }

                // the selected item is before the destination index
                // we need to account for this when inserting into the new location
                return previous + 1;
            },
            0
        );

      console.log(destinationIndexOffset)

        const result = destination.index - destinationIndexOffset;
        return result;
    })();

    // doing the ordering now as we are required to look up columns
    // and know original ordering
    const orderedSelectedTaskIds = [...selectedTaskIds];

    orderedSelectedTaskIds.sort((a, b) => {
        // moving the dragged item to the top of the list
        if (a === dragged) {
            return -1;
        }

        if (b === dragged) {
            return 1;
        }

        // sorting by their natural indexes
        const columnForA = getHomeColumn(entities, a);
        const indexOfA = columnForA.taskIds.indexOf(a);
        const columnForB = getHomeColumn(entities, b);
        const indexOfB = columnForB.taskIds.indexOf(b);

        if (indexOfA !== indexOfB) {
            return indexOfA - indexOfB;
        }

        // sorting by their order in the selectedTaskIds list
        return -1;
    });

    // we need to remove all of the selected tasks from their columns
    const withRemovedTasks = entities.columnIds.reduce((previous, columnId) => {
        const column = entities.columns[columnId];

        // remove the id's of the items that are selected
        const remainingTaskIds = column.taskIds.filter(
            id => !selectedTaskIds.includes(id)
        );

        previous[column.id] = withNewTaskIds(column, remainingTaskIds);
        return previous;
    }, entities.columns);

    const final = withRemovedTasks[destination.droppableId];

    const withInserted = (() => {
        const base = [...final.taskIds];
        base.splice(insertAtIndex, 0, ...orderedSelectedTaskIds);
        return base;
    })();

    // insert all selected tasks into final column
    const withAddedTasks = {
        ...withRemovedTasks,
        [final.id]: withNewTaskIds(final, withInserted)
    };

    const updated = {
        ...entities,
        columns: withAddedTasks
    };

    return {
        entities: updated,
        selectedTaskIds: orderedSelectedTaskIds
    };
};

const mutliDragAwareReorder = args => {
    if (args.selectedTaskIds.length > 1) {
        return reorderMultiDrag(args);
    }

    // return reorderSingleDrag(args);
};


class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            initialData: initialData,
            selectedTaskIds: [],
            draggingTaskId: null
        }
    }

    changeSelectedTaskIds = (value) => {
        this.setState({selectedTaskIds: value})
    }

    onDragEnd = result => {
        const destination = result.destination;
        const source = result.source;

        // nothing to do
        if (!destination || result.reason === "CANCEL") {
            this.setState({draggingTaskId: null});
            return;
        }

        const entities = this.state.initialData
        const selectedTaskIds = this.state.selectedTaskIds
        console.log(source)
        console.log(destination)

        console.log(selectedTaskIds)

        const processed = mutliDragAwareReorder({
            entities,
            selectedTaskIds,
            source,
            destination
        });

        console.log("onDragEnd", processed);

        this.setState({initialData: processed.entities});
        this.setState({draggingTaskId: null});
    }

    render() {
        return (
            <DragDropContext
                onDragEnd={this.onDragEnd}
            >
                {this.state.initialData.columnOrder.map(columnId => {
                    const column = this.state.initialData.columns[columnId]
                    const tasks = column.taskIds.map(taskId => this.state.initialData.tasks[taskId])

                    return <Column key={column.id} column={column} tasks={tasks}
                                   changeSelectedTaskIds={this.changeSelectedTaskIds} initialData={initialData}
                                   selectedTaskIds={this.state.selectedTaskIds}/>
                })}
            </DragDropContext>
        )
    }
}

export default App;
