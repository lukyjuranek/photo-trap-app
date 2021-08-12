
import React, { Component } from 'react';
import {
    StyleSheet, Text, View, ScrollView, Image, ImageBackground, TouchableOpacity, Alert, SafeAreaView, Dimensions, ToastAndroid,
    Platform, StatusBar, Modal, Pressable
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';

// <Item /> component
const Item = (props) => {

    const removeItem = (id) => {
        try {
            props.db.transaction(
                (tx) => {
                    tx.executeSql("DELETE FROM Items WHERE ID=?",
                        [id],
                        (tx, results) => {
                            console.log('Rows affected: ', results.rowsAffected);
                            if (results.rowsAffected > 0) {
                                console.log('Item removed successfully....');
                            } else console.error('Failed....');
                        }
                    ),
                        (tx, error) => {
                            console.error("Could not execute query");
                        };
                }, (err) => {
                    console.error("Error")
                }, () => {
                    console.log("Success")
                }
            );
        } catch (error) {
            console.error(error);
        }
        props.refresh();
    };

    const showConfirmDialog = (text) => {
        return Alert.alert(
            "Are you sure?",
            "Are you sure you want to delete this item?",
            [
                // The "Yes" button
                {
                    text: "Yes",
                    onPress: () => {
                        // setShowBox(false);
                        removeItem(props.id);
                        console.log("Delete item with ID: ", props.id);
                    },
                    style: 'destructive'
                },
                // The "No" button
                // Does nothing but dismiss the dialog when tapped
                {
                    text: "No",
                },
            ]
        );
    };
    return (
        <View style={styles.item}>
            <TouchableOpacity onPress={props.compare} style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <Image source={{ uri: `data:image/png;base64,${props.img}` }} style={styles.img} />
                <Text style={{ flexGrow: 2, fontSize: 15, color: 'black', marginLeft: 20 }}>{props.date}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={props.compare} activeOpacity={0.2}>
                <MaterialIcons name="compare" size={20} color="black" style={{ paddingRight: 15 }} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.2} onPress={() => showConfirmDialog(props.date)}>
                <Feather name="trash" size={20} color="red" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    item: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		margin: 10,
        color: 'white',
	},
    img: {
		height: 50,
		width: 50,
		borderRadius: 5
	},
})

export default Item;