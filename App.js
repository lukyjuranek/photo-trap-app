// import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef } from 'react';
import {
	StyleSheet, Text, View, ScrollView, Image, ImageBackground, TouchableOpacity, Alert, SafeAreaView, Dimensions, ToastAndroid,
	Platform, StatusBar, Modal, Pressable
} from 'react-native';
import Slider from '@react-native-community/slider'
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Camera } from 'expo-camera';
import * as SQLite from 'expo-sqlite';
import { Feather, MaterialIcons } from '@expo/vector-icons';

import Item from './src/components/Item';

var bg_img = require('./img/bg-img.png');

const Stack = createStackNavigator();

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

// <CameraScreen /> component
const CameraScreen = () => {
	const cameraRef = useRef();
	const [hasPermission, setHasPermission] = useState(null);
	const [type, setType] = useState(Camera.Constants.Type.back);
	const [imgBase64, setImgBase64] = useState('');
	const [isPreview, setIsPreview] = useState(false);

	useEffect(() => {
		(async () => {
			const { status } = await Camera.requestPermissionsAsync();
			setHasPermission(status === 'granted');
		})();
	}, []);

	if (hasPermission === null) {
		return null;
	}
	if (hasPermission === false) {
		return <Text>No access to camera</Text>;
	}

	const addItem = (name, img) => {
		try {
			db.transaction(
				(tx) => {
					// console.log(name, img);
					tx.executeSql("INSERT INTO Items (Name, Image) VALUES (?, ?)",
						[name, img],
						(tx, results) => {
							console.log('Rows affected: ', results.rowsAffected);
							if (results.rowsAffected > 0) {
								console.log('Data Inserted Successfully....');
							} else console.error('Failed....');
						}
					),
						(tx, error) => {
							console.error("Could not execute query");
						};
				}, (tx, err) => {
					console.error("Error")
				}, () => {
					console.log("Success")
				}
			);
		} catch (error) {
			console.error(error);
		}
	};

	const onSnap = async () => {
		if (cameraRef.current) {
			const options = { quality: 0.7, base64: true }; // Specify the quality of compression, from 0 to 1.
			// 0 means compress for small size, 1 means compress for maximum quality. 
			// values over 0.7 throws an error: Row too big to fit into CursorWindow
			const data = await cameraRef.current.takePictureAsync(options);
			const source = data.base64;
			setImgBase64(source);

			if (source) {
				await cameraRef.current.pausePreview();
				setIsPreview(true);
			}
		}
	};

	const getCurrentDateAndTime = () => {
		const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		const d = new Date();
		var date = d.getDate(); //To get the Current Date
		var month = monthNames[d.getMonth()]; //To get the Current Month
		var year = d.getFullYear(); //To get the Current Year
		var hours = d.getHours(); //To get the Current Hours
		var min = d.getMinutes(); //To get the Current Minutes
		return date + " " + month + ", " + year + " " + hours + ":" + min;
	}

	function notifyMessage(msg) {
		if (Platform.OS === 'android') {
			ToastAndroid.show(msg, ToastAndroid.SHORT)
		} else {
			Alert.alert(msg);
		}
	}

	const stopPreview = async () => {
		await cameraRef.current.resumePreview();
		setIsPreview(false);
	}

	const saveImage = () => {
		addItem(getCurrentDateAndTime(), imgBase64);
		stopPreview();
		notifyMessage("Image saved successfully");
	}

	return (
		<View style={{ flex: 1, backgroundColor: '#202020' }}>
			<Camera style={{ height: Dimensions.get('window').width * 4 / 3, }} type={Camera.Constants.Type.back} ratio={"4:3"} ref={cameraRef}>
			</Camera>
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
				{isPreview
					? <View style={{ flex: 1, justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row' }}>
						<TouchableOpacity onPress={saveImage}>
							<MaterialIcons name='save' size={50} color='white' />
							<Text style={{ color: 'white', textAlign: 'center' }}>Save</Text>
						</TouchableOpacity><TouchableOpacity onPress={stopPreview}>
							<MaterialIcons name='cancel' size={50} color='white' />
							<Text style={{ color: 'white', textAlign: 'center' }}>Cancel</Text>
						</TouchableOpacity>
					</View>
					: <TouchableOpacity onPress={onSnap}>
						<MaterialIcons name='camera' size={60} color='white' />
					</TouchableOpacity>
				}
			</View>
		</View>
	);
}

// <SettingsScreen /> component
// Imports modalVisible, setModalVisible state to change visibility
const ModalComponent = ({ modalVisible, setModalVisible }) => {
	return (
		<Modal
			animationType="slide"
			transparent={true}
			visible={modalVisible}
			onRequestClose={() => {
				setModalVisible(true);
			}}>
			<View style={styles.centeredView}>
				<View style={styles.modalView}>
					<Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 15 }}>Tutorial</Text>
					<Text style={styles.modalText}>
						<Text style={{ fontWeight: 'bold' }}>Step 1: </Text>
						Take a photo of your items and save it
					</Text>
					<Text style={styles.modalText}>
						<Text style={{ fontWeight: 'bold' }}>Step 2: </Text>
						Click on the photo when you want to check if anyone moved any of your items
					</Text>
					<Text style={styles.modalText}>
						<Text style={{ fontWeight: 'bold' }}>Step 3: </Text>
						Align the photo with the view from your camera (use the slider to adjust transparency) and click the shutter button
					</Text>
					<Text style={styles.modalText}>
						<Text style={{ fontWeight: 'bold' }}>Step 4: </Text>
						Using the compare button switch between the first and second photo to see if there is a difference
					</Text>
					<Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 15 }}>Tips</Text>
					<Text style={styles.modalText}>To get the best results remeber the exact place where you took the photo from.</Text>
					<Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 15 }}>About</Text>
					<Text style={styles.modalText}>Created by Lukáš Juránek in React Native{"\n"}</Text>
					<Pressable style={[styles.button, styles.buttonClose]} onPress={() => setModalVisible(false)} >
						<Text style={styles.textStyle}>Close</Text>
					</Pressable>
				</View>
			</View>
		</Modal>
	);
}

// <Compare screen /> component
const CompareScreen = ({ route, navigation }) => {
	// Get the parameter
	const { itemId } = route.params;
	const cameraRef = useRef();
	const [hasPermission, setHasPermission] = useState(null);
	const [type, setType] = useState(Camera.Constants.Type.back);
	const [imgBase64, setImgBase64] = useState('');
	const [opacity, setOpacity] = useState(0.5);
	const [isPreview, setIsPreview] = useState(false);

	const getImageByID = async (id) => {
		try {
			await db.transaction(
				async (tx) => {
					await tx.executeSql(
						"SELECT Image from Items WHERE ID=?",
						[id],
						(tx, results) => {
							setImgBase64(results.rows.item(0).Image);
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

	useEffect(() => {
		getImageByID(itemId);
		(async () => {
			const { status } = await Camera.requestPermissionsAsync();
			setHasPermission(status === 'granted');
		})();
	}, []);

	if (hasPermission === null) {
		return null;
	}
	if (hasPermission === false) {
		return <Text>No access to camera</Text>;
	}

	const onSnap = async () => {
		if (cameraRef.current) {
			const options = { quality: 0.7, base64: true }; // Specify the quality of compression, from 0 to 1. 0 means compress for small size, 1 means compress for maximum quality. 
			// values over 0.7 throws an error: Row too big to fit into CursorWindow
			// const data = await cameraRef.current.takePictureAsync(options);
			// const source = data.base64;
			// setImgBase64(source);

			if (true) {
				await cameraRef.current.pausePreview();
				setIsPreview(true);
				setOpacity(1);
			}
		}
	};

	const stopPreview = async () => {
		await cameraRef.current.resumePreview();
		setIsPreview(false);
		setOpacity(0.5);
	}

	return (
		<View style={{ flex: 1, backgroundColor: '#202020' }}>
			<View style={{ position: 'relative', height: Dimensions.get('window').width * 4 / 3 }}>
				<Camera style={{ height: Dimensions.get('window').width * 4 / 3, }} type={Camera.Constants.Type.back} ratio={"4:3"} ref={cameraRef}>
				</Camera>
				<Image style={{ opacity, position: 'absolute', top: 0, left: 0, width: '100%', height: Dimensions.get('window').width * 4 / 3, }} source={{ uri: `data:image/png;base64,${imgBase64}` }} />
			</View>
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
				{isPreview
					? <View style={{ flex: 1, justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row' }}>
						<TouchableOpacity onPressIn={() => setOpacity(0)} onPressOut={() => setOpacity(1)} style={{ flex: 1, alignItems: 'center' }}>
							<MaterialIcons name="compare" size={50} color="white" />
							<Text style={{ color: 'white', textAlign: 'center' }}>Compare</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={stopPreview} style={{ flex: 1, alignItems: 'center' }}>
							<MaterialIcons name='cancel' size={50} color='white' />
							<Text style={{ color: 'white', textAlign: 'center' }}>Cancel</Text>
						</TouchableOpacity>
					</View>
					: <View style={{ flex: 1, justifyContent: 'space-evenly', alignItems: 'center', flexDirection: 'row' }}>
						<Slider
							onValueChange={value => setOpacity(value)}
							value={opacity}
							style={{ width: 180, height: 40 }}
							step={0.1}
							minimumValue={0}
							maximumValue={1}
							minimumTrackTintColor="#FFFFFF"
							maximumTrackTintColor="#000000"
							thumbTintColor="#FFFFFF"
						/>
						<TouchableOpacity onPress={onSnap}>
							<MaterialIcons name='camera' size={60} color='white' />
						</TouchableOpacity></View>
				}
			</View>
		</View>
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
	},
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 22
	},
	modalView: {
		margin: 20,
		backgroundColor: "white",
		borderRadius: 20,
		padding: 25,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5
	},
	button: {
		borderRadius: 15,
		padding: 8
	},
	buttonClose: {
		backgroundColor: "#2196F3"
	},
	textStyle: {
		color: "white",
		fontWeight: "bold",
		textAlign: "center"
	},
	modalText: {
		marginBottom: 15,
		textAlign: "center"
	}
});