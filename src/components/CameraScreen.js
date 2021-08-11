
import React, { Component, useState, useEffect, useRef } from 'react';
import {
	StyleSheet, Text, View, ScrollView, Image, ImageBackground, TouchableOpacity, Alert, SafeAreaView, Dimensions, ToastAndroid,
	Platform, StatusBar, Modal, Pressable
} from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';

const db = SQLite.openDatabase('MainDB', () => { console.error(error) });

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

export default CameraScreen;