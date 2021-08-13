// import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SQLite from 'expo-sqlite';

// Imports custom components
import MainScreen from './src/components/MainScreen';
import CameraScreen from './src/components/CameraScreen';
import CompareScreen from './src/components/CompareScreen';

// Creates stack navigator
const Stack = createStackNavigator();

// Opens DB
const db = SQLite.openDatabase('MainDB', () => { console.error(error) });

export default function App() {
	StatusBar.setBarStyle('dark-content', true);

	const createTable = () => {
		db.transaction((tx) => {
			tx.executeSql(
				"CREATE TABLE IF NOT EXISTS "
				+ "Items "
				+ "(ID INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT, Image TEXT);", [],
				(tx, results) => {
					// console.log("Table created successfully")
				},
				(tx, err) => {
					console.error("Error when creating table")
				});
		});
	};

	createTable();
	return (
		<NavigationContainer>
			<Stack.Navigator>
				<Stack.Screen name="Home" component={MainScreen} options={{
					headerShown: false,
				}} />
				< Stack.Screen name="Camera" component={CameraScreen} options={{
					headerStyle: {
						backgroundColor: '#202020',
					},
					headerTintColor: 'white'
				}} />
				< Stack.Screen name="Compare" component={CompareScreen} options={{
					headerStyle: {
						backgroundColor: '#202020',
					},
					headerTintColor: 'white'
				}} />
			</Stack.Navigator>
		</NavigationContainer>
	);
}