import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function AppTabsLayout(): JSX.Element {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#38bdf8",
        tabBarInactiveTintColor: "#93c5fd",
        tabBarStyle: {
          backgroundColor: "#09090b",
          borderTopColor: "#18181b"
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600"
        }
      }}
    >
      <Tabs.Screen
        name="cockpit"
        options={{
          title: "Cockpit",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="logbook"
        options={{
          title: "Logbook",
          tabBarIcon: ({ color, size }) => <Ionicons name="list" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="preflight"
        options={{
          href: null
        }}
      />
      <Tabs.Screen
        name="active-flight"
        options={{
          href: null
        }}
      />
      <Tabs.Screen
        name="debrief"
        options={{
          href: null
        }}
      />
    </Tabs>
  );
}
