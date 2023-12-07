import { View, Text, FlatList, useWindowDimensions } from "react-native";
import React, { useRef, useMemo } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import orders from "../assets/data/orders.json";
import OrderItem from "../components/OrderItem";
import MapView, { Marker } from "react-native-maps";
import { BuildingStorefrontIcon } from "react-native-heroicons/solid";

export default function OrdersScreen() {
  const bottomSheetRef = useRef(null);

  const { height, width } = useWindowDimensions();

  const snapPoints = useMemo(() => ["12%", "95%"], []);

  return (
    <View className="flex-1">
      <MapView
        initialRegion={{
          latitude: 46.88731,
          longitude: 28.67037,
          latitudeDelta: 0.0722,
          longitudeDelta: 0.0721,
        }}
        style={{
          height,
          width,
        }}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        {orders.map((order) => (
          <Marker
            key={order.id}
            title={order.Restaurant.name}
            description={order.Restaurant.address}
            coordinate={{
              latitude: order.Restaurant.lat,
              longitude: order.Restaurant.lng,
            }}
          >
            <View className="bg-green-700 p-2 rounded-full">
              <BuildingStorefrontIcon size={22} color="white" />
            </View>
          </Marker>
        ))}
      </MapView>
      <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints}>
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold mb-2">You're Online</Text>
          <Text className="text-base text-gray-500">
            Available Orders: {orders.length}
          </Text>
        </View>
        <FlatList
          className="w-full"
          data={orders}
          renderItem={({ item }) => <OrderItem order={item} />}
        />
      </BottomSheet>
    </View>
  );
}
