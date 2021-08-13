import React, { Component, useState } from 'react';
import {
	StyleSheet, Text, View, ScrollView, ImageBackground, TouchableOpacity, SafeAreaView, Platform, StatusBar
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SQLite from 'expo-sqlite';
import { Feather, MaterialIcons } from '@expo/vector-icons';

import Item from './Item';
import ModalComponent from './ModalComponent';

var bg_img = require('./../../img/bg-img.png');

const db = SQLite.openDatabase('MainDB', () => { console.error(error) });

// <MainScreen /> component
const MainScreen = ({ navigation }) => {

	const [items, setItems] = useState([]);
	const isFocused = useIsFocused();
	const [modalVisible, setModalVisible] = useState(false);

	// Runs when items focused
	React.useEffect(() => {
		// console.log("Use effect");
		getData();
		// setItems(getData());
		// console.log("Test", typeof (items));
		// console.log(items.length);
	}, [isFocused]);

	const getData = async () => {
		console.log('getData');
		try {
			await db.transaction(
				async (tx) => {
					await tx.executeSql(
						"SELECT ID, Name, Image from Items",
						[],
						(tx, results) => {
							var temp = [];
							for (let i = 0; i < results.rows.length; ++i)
								temp.push(results.rows.item(i));
							setItems(temp);
							// console.log("getData() succesfull");
						},
						(tx, error) => {
							console.error("Could not execute query" + error);
						}
					)
				})
		} catch (error) {
			console.log(error);
		};
	};

	return (
		<SafeAreaView style={{ flex: 1 }}>

			{Platform.OS === 'android'
				? <StatusBar barStyle={'light-content'} />
				: <StatusBar barStyle={'dark-content'} />
			}

			<ModalComponent modalVisible={modalVisible} setModalVisible={setModalVisible} />

			<View style={styles.container}>
				<ImageBackground source={bg_img} style={styles.imagebackground} resizeMode='cover'>

					{/* Top bar */}
					<View style={styles.topPanel}>
						<Text style={{ fontSize: 30, color: 'white', fontWeight: 'bold' }}>Photo Trap</Text>
						<TouchableOpacity style={styles.touchableOpacity} activeOpacity={0.2} onPress={() => setModalVisible(true)}>
							<Feather name="help-circle" size={30} color="white" />
						</TouchableOpacity>
					</View>

					{/* List of items */}
					<View style={styles.whitePanel}>
						<ScrollView style={styles.scrollview} overScrollMode='never'>
							{/* Add button */}
							<TouchableOpacity style={styles.item} onPress={() => { navigation.navigate('Camera') }}>
								<MaterialIcons name="add-a-photo" size={30} color="gray" style={{ padding: 10 }} />
								<Text style={{ fontSize: 15, color: 'grey', flexGrow: 2, marginLeft: 20 }}>Add ...</Text>
							</TouchableOpacity>
							{
								items.slice(0).reverse().map((item, key) => {
									return (
										<Item
											db={db}
											img={item.Image}
											date={item.Name}
											key={item.ID}
											id={item.ID}
											refresh={getData}
											compare={() => {
												navigation.navigate('Compare', {
													itemId: item.ID,
												})
											}} />);
								})
							}
							<View style={{ height: 100 }}></View>
						</ScrollView>
					</View>
				</ImageBackground>
			</View>
		</SafeAreaView>
	);
}


const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	topPanel: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 40,
		marginHorizontal: 20
	},
	scrollview: {
		flex: 1,
		margin: 0,
		padding: 20,
	},
	whitePanel: {
		marginTop: 50,
		backgroundColor: 'white',
		flex: 1,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
	},
	img: {
		height: 50,
		width: 50,
		borderRadius: 5
	},
	item: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		margin: 10,
	},
	imagebackground: {
		flex: 1,
		width: '100%',
		height: '100%'
	}
});

export default MainScreen;