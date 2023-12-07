import {
  View,
  Text,
  useWindowDimensions,
  ActivityIndicator,
  Pressable,
} from "react-native";
import React, { useRef, useMemo, useEffect, useState } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import {
  BuildingStorefrontIcon,
  MapPinIcon,
  ShoppingBagIcon,
  UserIcon,
} from "react-native-heroicons/solid";
import orders from "../assets/data/orders.json";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import MapViewDirections from "react-native-maps-directions";
import { GOOGLE_MAP_API_KEY } from "@env";

const order = orders[0];

const restaurantLocation = {
  latitude: order.Restaurant.lat,
  longitude: order.Restaurant.lng,
};
const deliveryLocation = {
  latitude: order.User.lat,
  longitude: order.User.lng,
};

const ORDER_STATUSES = {
  READY_FOR_PICKUP: "READY_FOR_PICKUP",
  ACCEPTED: "ACCEPTED",
  PICKED_UP: "PICKED_UP",
};

export default function OrderDeliveryScreen() {
  const bottomSheetRef = useRef(null);
  const mapRef = useRef(null);
  const { height, width } = useWindowDimensions();
  const [driverLocation, setDriverLocation] = useState(null);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [totalKm, setTotalKm] = useState(0);
  const [deliveryStatus, setDeliveryStatus] = useState(
    ORDER_STATUSES.READY_FOR_PICKUP
  );
  const [isDriverClose, setIsDriverClose] = useState(false);

  const snapPoints = useMemo(() => ["12%", "95%"], []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (!status === "granted") {
        console.log("You don't have permission for location");
        return;
      }

      let location = await Location.getCurrentPositionAsync();
      setDriverLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();

    const foregroundSubscription = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 100,
      },
      (updatedLocation) => {
        setDriverLocation({
          latitude: updatedLocation.coords.latitude,
          longitude: updatedLocation.coords.longitude,
        });
      }
    );

    return () => {
      foregroundSubscription;
    };
  }, []);

  if (!driverLocation) {
    return <ActivityIndicator size={"large"} />;
  }

  const onButtonpressed = () => {
    if (deliveryStatus === ORDER_STATUSES.READY_FOR_PICKUP) {
      bottomSheetRef.current?.collapse();
      mapRef.current.animateToRegion({
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setDeliveryStatus(ORDER_STATUSES.ACCEPTED);
    }
    if (deliveryStatus === ORDER_STATUSES.ACCEPTED) {
      bottomSheetRef.current?.collapse();
      setDeliveryStatus(ORDER_STATUSES.PICKED_UP);
    }
    if (deliveryStatus === ORDER_STATUSES.PICKED_UP) {
      bottomSheetRef.current?.collapse();
      navigation.goBack();
      console.warn("Delivery Finished");
    }
  };

  const renderButtonTitle = () => {
    if (deliveryStatus === ORDER_STATUSES.READY_FOR_PICKUP) {
      return "Accept Order";
    }
    if (deliveryStatus === ORDER_STATUSES.ACCEPTED) {
      return "Pick-Up Order";
    }
    if (deliveryStatus === ORDER_STATUSES.PICKED_UP) {
      return "Complete Delivery";
    }
  };

  const isButtonDisabled = () => {
    if (deliveryStatus === ORDER_STATUSES.READY_FOR_PICKUP) {
      return false;
    }
    if (deliveryStatus === ORDER_STATUSES.ACCEPTED && isDriverClose) {
      return false;
    }
    if (deliveryStatus === ORDER_STATUSES.PICKED_UP && isDriverClose) {
      return false;
    }
    return true;
  };

  return (
    <View className="flex-1">
      <MapView
        ref={mapRef}
        initialRegion={{
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
          latitudeDelta: 0.0722,
          longitudeDelta: 0.0721,
        }}
        showsUserLocation={true}
        followsUserLocation={true}
        style={{
          height,
          width,
        }}
      >
        <MapViewDirections
          origin={driverLocation}
          destination={deliveryLocation}
          strokeWidth={6}
          waypoints={
            deliveryStatus === ORDER_STATUSES.READY_FOR_PICKUP
              ? [restaurantLocation]
              : []
          }
          strokeColor="#3FC060"
          onReady={(result) => {
            if (result.distance <= 0.1) {
              setIsDriverClose(true);
            }
            setTotalMinutes(result.duration);
            setTotalKm(result.distance);
          }}
          apikey={GOOGLE_MAP_API_KEY}
        />

        <Marker
          title={order.Restaurant.name}
          description={order.Restaurant.address}
          coordinate={restaurantLocation}
        >
          <View className="bg-green-700 p-2 rounded-full">
            <BuildingStorefrontIcon size={22} color="white" />
          </View>
        </Marker>

        <Marker
          title={order.User.name}
          description={order.User.address}
          coordinate={deliveryLocation}
        >
          <View className="bg-green-700 p-2 rounded-full">
            <UserIcon size={22} color="white" />
          </View>
        </Marker>
      </MapView>
      <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints}>
        <View className="justify-center items-center">
          <View className="border-b-2 border-gray-400 w-full justify-center items-center">
            <View className="flex-row items-center mt-4 mb-6 ">
              <Text className="text-2xl font-semibold">
                {Math.ceil(totalMinutes)} min
              </Text>
              <ShoppingBagIcon size={24} color="green" />
              <Text className="text-2xl font-semibold">
                {totalKm.toFixed(2)} km
                {/* napraviti funkciju da preracuna kada je ispod kilometra da budu metri */}
              </Text>
            </View>
          </View>
          <View>
            <View className="px-3 border-b border-gray-400">
              <Text className="text-3xl font-semibold tracking-wide my-6">
                {order.Restaurant.name}
              </Text>
              <View className="flex-row items-center space-x-3">
                <BuildingStorefrontIcon size={26} color="gray" />
                <Text className="text-gray-500 text-base">
                  {order.Restaurant.address}
                </Text>
              </View>
              <View className="flex-row items-center space-x-3 my-5">
                <MapPinIcon size={26} color="gray" />
                <Text className="text-gray-500 text-base">
                  {order.Restaurant.address}
                </Text>
              </View>
            </View>
            <View className="mt-3 px-3">
              <Text className="text-gray-500 py-1 text-base">
                Onion Rings x1
              </Text>
              <Text className="text-gray-500 py-1 text-base">
                Onion Rings x1
              </Text>
              <Text className="text-gray-500 py-1 text-base">
                Onion Rings x1
              </Text>
            </View>
          </View>
        </View>
        <Pressable
          className="absolute bottom-0 w-full"
          onPress={onButtonpressed}
          disabled={isButtonDisabled()}
        >
          <View
            className={`${
              isButtonDisabled() ? "bg-gray-400" : "bg-green-400"
            }  py-5 mx-3 mb-3 rounded-md flex-row justify-center align-center`}
          >
            <Text className="text-white text-2xl font-bold tracking-wide">
              {renderButtonTitle()}
            </Text>
          </View>
        </Pressable>
      </BottomSheet>
    </View>
  );
}
