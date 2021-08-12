import React, { Component, useState, useEffect, useRef } from 'react';
import {
	StyleSheet, Text, View, ScrollView, Image, ImageBackground, TouchableOpacity, Alert, SafeAreaView, Dimensions, ToastAndroid,
	Platform, StatusBar, Modal, Pressable
} from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider'
import { Camera } from 'expo-camera';

const db = SQLite.openDatabase('MainDB', () => { console.error(error) });

// <ComparScreen /> component
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

export default CompareScreen;