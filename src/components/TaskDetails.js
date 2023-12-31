import { useTasksContext } from "../hooks/useTasksContext";
import { useAuthContext } from "../hooks/useAuthContext";
import { format } from "date-fns";
import { useState } from "react";
import Confetti from "./Confetti";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEyeSlash, faPen, faTrashAlt, faCheck
} from '@fortawesome/free-solid-svg-icons';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const TaskDetails = ({ task, onClose  }) => {
  const { dispatch } = useTasksContext();
  const { user } = useAuthContext();
  const [isVisible, setIsVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Track whether the task is being edited
  const [editedTask, setEditedTask] = useState(task); // Store the edited task details
  const [clickCoordinates, setClickCoordinates] = useState({ x: 0, y: 0 });
  const [zIndex, setZIndex] = useState(0);
  const [titleError, setTitleError] = useState('');

  const handleDelete = async () => {
    if (!user) {
      return;
    }
    try{
      const response = await fetch(`${BACKEND_URL}/api/tasks/` + task._id, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const json = await response.json();

      if (response.ok) {
        dispatch({ type: "DELETE_TASK", payload: json });
      } else {
        console.error('Failed to delete task:', json.error);
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
    try{
      onClose();
    }
    catch (e){
      console.error('Nothing to worry just no popup...', e);
    }
  };

  const handleUncheckClick = async () => {
    const editedTask = {
      ...task,
      isCompleted: true, // Modify the isCompleted attribute to true
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/tasks/` + task._id, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(editedTask), // Send the updated task details
      });

      const json = await response.json();

      if (response.ok) {
        dispatch({ type: 'UPDATE_TASK', payload: json });
      } else {
        console.error('Failed to update task:', json.error);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
    setTimeout(() => {
      try{
          onClose();
      }
      catch (e){
        console.error('Nothing to worry just no popup...', e);
      }
    }, 300); // Delay of 300 milliseconds to match the conffetti duration
  };

  const handleCheckClick = async () => {
    const editedTask = {
      ...task,
      isCompleted: false, // Modify the isCompleted attribute to true
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/tasks/` + task._id, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(editedTask), // Send the updated task details
      });

      const json = await response.json();

      if (response.ok) {
        dispatch({ type: 'UPDATE_TASK', payload: json });
      } else {
        console.error('Failed to update task:', json.error);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
    try{
      onClose();
    }
    catch (e){
      console.error('Nothing to worry just no popup...', e);
    }
  };

  const handleEdit = () => {
    setIsEditing(true); // Set isEditing to true to switch to edit mode
  };

  const handleSave = async () => {
    if (editedTask.title.trim() === '') {
      setTitleError(<span style={{ color: 'red' }}>Title cannot be empty</span>);
      return;
    }

    const response = await fetch(`${BACKEND_URL}/api/tasks/` + task._id, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify(editedTask), // Send the updated task details
    });

    const json = await response.json();

    if (response.ok) {
      dispatch({ type: 'UPDATE_TASK', payload: json });
      setIsEditing(false); // Switch back to view mode after saving
      setTitleError(''); // Reset the title error
    }
  };

  const handleCancel = () => {
    setIsEditing(false); // Cancel the edit mode and discard changes
    setEditedTask(task); // Reset the edited task details to the original task
    setTitleError(''); // Reset the title error
  };

  const handleChange = (e) => {
    setEditedTask({ ...editedTask, [e.target.name]: e.target.value }); // Update the edited task details
  };

  const handleUncheckRadioButtonClick = (e) => {
    // Get the click coordinates relative to the window
    const { clientX, clientY } = e;
    const { top, left } = document.documentElement.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;

    // Set the click coordinates
    setClickCoordinates({ x: x / window.innerWidth, y: y / window.innerHeight });
    setIsVisible(true); // Set isVisible to true when the radio button is clicked
    setZIndex((prevZIndex) => prevZIndex + 1); // Increment the zIndex value

    setTimeout(() => {
      handleUncheckClick(); // Call handleUncheckClick to edit the task
    }, 3500);
  };

  const formattedDeadline = task.deadline
    ? format(new Date(task.deadline), "MMMM dd, yyyy, HH:mm")
    : "";

  return (
    <>
      {isVisible && <Confetti clickCoordinates={clickCoordinates} zIndex={zIndex} />}
      {!isVisible && (
        <div className="task-details">
          {isEditing ? (
            <>
              <h4>
                <input
                  type="text"
                  name="title"
                  value={editedTask.title}
                  onChange={handleChange}
                  className={titleError ? 'error-input' : ''}
                />
              </h4>
              {titleError && <p className="error">{titleError}</p>}
              <p>
                <strong>Note: </strong>
                <input
                  name="note"
                  value={editedTask.note}
                  onChange={handleChange}
                />
              </p>
              <p>
                <label>Type:</label>
                <select
                  name="type"
                  value={editedTask.type}
                  onChange={handleChange}
                >
                  <option value="">Select a type</option>
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="home">Home</option>
                  <option value="educational">Educational</option>
                </select>
              </p>
              <p>
                <strong>Deadline:</strong>
                <input
                  type="datetime-local"
                  name="deadline"
                  value={editedTask.deadline}
                  onChange={handleChange}
                />
              </p>
              <p>
                <label>Priority:</label>
                <select
                  name="priority"
                  value={editedTask.priority}
                  onChange={handleChange}
                >
                  <option value="">Select a Priority</option>
                  <option value="low">Low &#x1F7E9;</option>
                  <option value="medium">Medium &#x1F7E8;</option>
                  <option value="high">High &#x1F534;</option>
                </select>
              </p>
              <div className="edit-buttons">
                <button onClick={handleSave}>Save</button>
                <button onClick={handleCancel}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <h4 style={task.isCompleted ? { textDecoration: 'line-through' } : {}}>
                {task.title}
              </h4>
              {task.note && (
                <p style={task.isCompleted ? { textDecoration: 'line-through' } : {}}>
                  <strong>Note: </strong>
                  {task.note}
                </p>
              )}
              {task.type && (
                <p style={task.isCompleted ? { textDecoration: 'line-through' } : {}}>
                  <strong>Type: </strong>
                  {task.type}
                </p>
              )}
              {task.deadline && (
                <p style={task.isCompleted ? { textDecoration: 'line-through' } : {}}>
                  <strong>Deadline: </strong>
                  {formattedDeadline}
                </p>
              )}
              {task.priority && (
                <p style={task.isCompleted ? { textDecoration: 'line-through' } : {}}>
                  <strong>Priority: </strong>
                  {task.priority}
                </p>
              )}

              <div className="task-buttons">
                <button className="task-edit" onClick={handleEdit}>
                  <FontAwesomeIcon icon={faPen} /> Edit
                </button>
                {!task.isCompleted && (
                  <button className="task-done" onClick={handleUncheckRadioButtonClick}>
                    <FontAwesomeIcon icon={faCheck} /> Done
                  </button>
                )}
                {task.isCompleted && (
                  <button className="task-recover" onClick={handleCheckClick}>
                    <FontAwesomeIcon icon={faEyeSlash} /> Recover Task
                  </button>
                )}
                <button className="task-delete" onClick={handleDelete}>
                  <FontAwesomeIcon icon={faTrashAlt} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default TaskDetails;
