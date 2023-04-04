import React from "react";
import { Draggable } from "react-beautiful-dnd";
import './App.css'

const PRIMARY_BUTTON_NUMBER = 0;

const getHomeColumn = (entities, taskId) => {
    return entities.columns['column-1'];
};

const multiSelect = (entities, selectedTaskIds, newTaskId) => {
    // Nothing already selected
    if (!selectedTaskIds.length) {
        return [newTaskId];
    }

    const columnOfNew = getHomeColumn(entities, newTaskId);
    const indexOfNew = columnOfNew.taskIds.indexOf(newTaskId);

    const lastSelected = selectedTaskIds[selectedTaskIds.length - 1];
    const columnOfLast = getHomeColumn(entities, lastSelected);
    const indexOfLast = columnOfLast.taskIds.indexOf(lastSelected);

    // multi selecting to another column
    // select everything up to the index of the current item
    if (columnOfNew !== columnOfLast) {
        return columnOfNew.taskIds.slice(0, indexOfNew + 1);
    }

    // multi selecting in the same column
    // need to select everything between the last index and the current index inclusive

    // nothing to do here
    if (indexOfNew === indexOfLast) {
        return null;
    }

    const isSelectingForwards = indexOfNew > indexOfLast;
    const start = isSelectingForwards ? indexOfLast : indexOfNew;
    const end = isSelectingForwards ? indexOfNew : indexOfLast;

    const inBetween = columnOfNew.taskIds.slice(start, end + 1);

    // everything inbetween needs to have it's selection toggled.
    // with the exception of the start and end values which will always be selected

    const toAdd = inBetween.filter(taskId => {
        // if already selected: then no need to select it again
        if (selectedTaskIds.includes(taskId)) {
            return false;
        }
        return true;
    });

    const sorted = isSelectingForwards ? toAdd : [...toAdd].reverse();
    const combined = [...selectedTaskIds, ...sorted];

    return combined;
};

export default class Task extends React.Component {

    constructor(props) {
        super(props);
    }

    toggleSelection = (taskId) => {
        const wasSelected = this.props.selectedTaskIds.includes(taskId);

        const newTaskIds = (() => {
            // Task was not previously selected
            // now will be the only selected item
            if (!wasSelected) {
                return [taskId];
            }

            // Task was part of a selected group
            // will now become the only selected item
            if (this.props.selectedTaskIds.length > 1) {
                return [taskId];
            }

            // task was previously selected but not in a group
            // we will now clear the selection
            return [];
        })();

        this.props.changeSelectedTaskIds(newTaskIds);
    };

    multiSelectTo = (newTaskId) => {
        const updated = multiSelect(this.props.initialData, this.props.selectedTaskIds, newTaskId);

        if (updated == null) {
            return;
        }

        this.props.changeSelectedTaskIds(updated);
    };

    toggleSelectionInGroup = (taskId) => {
        const index = this.props.selectedTaskIds.indexOf(taskId);

        // if not selected - add it to the selected items
        if (index === -1) {
            this.props.changeSelectedTaskIds([...this.props.selectedTaskIds, taskId]);
            return;
        }

        // it was previously selected and now needs to be removed from the group
        const shallow = [...this.props.selectedTaskIds];
        shallow.splice(index, 1);

        this.props.changeSelectedTaskIds([...this.props.selectedTaskIds, shallow]);
    };

    wasToggleInSelectionGroupKeyUsed = (e) => {
        const isUsingWindows = navigator.platform.indexOf("Win") >= 0;
        return isUsingWindows ? e.ctrlKey : e.metaKey;
    };

    wasMultiSelectKeyUsed = (e) => e.shiftKey;

    performAction = (e, task) => {
        if (this.wasToggleInSelectionGroupKeyUsed(e)) {
            this.toggleSelectionInGroup(task.id);
            return;
        }

        if (this.wasMultiSelectKeyUsed(e)) {
            this.multiSelectTo(task.id);
            return;
        }

        this.toggleSelection(task.id);
    }

    onClickRow = (event: MouseEvent, task: any) => {
        if (event.defaultPrevented) {
            return
        }

        if (event.button !== PRIMARY_BUTTON_NUMBER) {
            return;
        }

        event.preventDefault()
        this.performAction(event, task)
    }

    render() {

        return (
            <Draggable draggableId={this.props.task.id} index={this.props.index}>
                {(provided) => (
                    <div
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={e => this.onClickRow(e, this.props.task)}
                        ref={provided.innerRef}
                    >{this.props.task.content}</div>
                )}
            </Draggable>
        )
    }
}