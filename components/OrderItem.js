import { Text, Image, View, Pressable } from "react-native";
import React from "react";
import { CheckIcon } from "react-native-heroicons/solid";
import { useNavigation } from "@react-navigation/native";

export default function OrderItem({ order }) {
  const navigation = useNavigation();

  return (
    <Pressable
      className="flex-row justify-between border rounded-md h-36 border-green-400 m-3"
      onPress={() => navigation.navigate("OrderDelivery", { id: order.id })}
    >
      <View className="flex-row flex-1">
        <Image
          source={{
            uri: order.Restaurant.image,
          }}
          className="w-24 m-1 rounded-md"
        />
        <View className="mx-2 flex-1 py-1">
          <Text className="text-lg font-bold leading-6">
            {order.Restaurant.name}
          </Text>
          <Text className="text-gray-500">{order.Restaurant.address}</Text>
          <Text className="font-semibold pt-2">Delivery details:</Text>

          <Text className="text-gray-500">{order.User.name}</Text>
          <Text className="text-gray-500">{order.User.address}</Text>
        </View>
      </View>
      <View className="bg-green-400 rounded-r-sm justify-center px-2 overflow-hidden">
        <CheckIcon size={24} color="white" />
      </View>
    </Pressable>
  );
}
