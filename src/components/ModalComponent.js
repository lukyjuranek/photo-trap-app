import React, { Component, useState, useEffect, useRef } from 'react';
import {
    StyleSheet, Text, View, ScrollView, Image, ImageBackground, TouchableOpacity, Alert, SafeAreaView, Dimensions, ToastAndroid,
    Platform, StatusBar, Modal, Pressable
} from 'react-native';

// <ModalComponent /> component
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

const styles = StyleSheet.create({
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

export default ModalComponent;