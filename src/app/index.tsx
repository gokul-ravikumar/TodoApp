
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Task = {
  id: string;
  title: string;
  completed: boolean;
};

const STORAGE_KEY = '@todo_tasks';

export default function HomeScreen() {
  const [input, setInput] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved tasks when the screen opens
  useEffect(() => {
    async function loadTasks() {
      try {
        const savedTasks = await AsyncStorage.getItem(STORAGE_KEY);

        if (savedTasks !== null) {
          setTasks(JSON.parse(savedTasks) as Task[]);
        }
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setIsLoaded(true);
      }
    }

    loadTasks();
  }, []);

  // Save tasks whenever the task list changes
  useEffect(() => {
    if (!isLoaded) return;

    async function saveTasks() {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(tasks)
        );
      } catch (error) {
        console.error('Failed to save tasks:', error);
      }
    }

    saveTasks();
  }, [tasks, isLoaded]);

  function addTask() {
    const title = input.trim();

    if (!title) return;

    setTasks((previous) => [
      ...previous,
      {
        id: Date.now().toString(),
        title,
        completed: false,
      },
    ]);

    setInput('');
  }

  function toggleTask(id: string) {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  }

  function deleteTask(id: string) {
    setTasks((previous) =>
      previous.filter((task) => task.id !== id)
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>My To-Do List</Text>

      <Text style={styles.subtitle}>
        Make today productive!
      </Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Enter a task..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={addTask}
          returnKeyType="done"
        />

        <Pressable
          style={styles.addButton}
          onPress={addTask}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      <Text style={styles.count}>
        {tasks.length} tasks ·{' '}
        {tasks.filter((task) => task.completed).length} completed
      </Text>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No tasks yet. Add your first task!
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.taskRow}>
            <Pressable
              style={styles.taskTitle}
              onPress={() => toggleTask(item.id)}
            >
              <Text
                style={[
                  styles.taskText,
                  item.completed && styles.completed,
                ]}
              >
                {item.completed ? '✓  ' : '○  '}
                {item.title}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => deleteTask(item.id)}
            >
              <Text style={styles.delete}>Delete</Text>
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FB',
    padding: 22,
  },
  heading: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#202942',
    marginTop: 20,
  },
  subtitle: {
    color: '#737B8C',
    marginTop: 8,
    marginBottom: 25,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDE2EC',
  },
  addButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  count: {
    marginVertical: 22,
    color: '#737B8C',
  },
  empty: {
    color: '#737B8C',
    textAlign: 'center',
    marginTop: 30,
  },
  taskRow: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTitle: {
    flex: 1,
    marginRight: 12,
  },
  taskText: {
    fontSize: 16,
    color: '#202942',
  },
  completed: {
    textDecorationLine: 'line-through',
    color: '#969CAC',
  },
  delete: {
    color: '#DC2626',
    fontWeight: '600',
  },
});
