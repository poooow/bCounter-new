import AsyncStorage from '@react-native-async-storage/async-storage';

export async function updateData(data: any): Promise<void> {
  try {
    const jsonString = JSON.stringify(data);
    await AsyncStorage.setItem('bCounterStorage', jsonString);
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

export async function retrieveData(): Promise<any> {
  try {
    const jsonString = await AsyncStorage.getItem('bCounterStorage');
    return jsonString ? JSON.parse(jsonString) : null;
  } catch (error) {
    console.error('Error retrieving data:', error);
    return null;
  }
}

