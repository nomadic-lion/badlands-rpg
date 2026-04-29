import { Slot, SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import { Anton_400Regular } from '@expo-google-fonts/anton';
import { SpaceGrotesk_400Regular, SpaceGrotesk_600SemiBold } from '@expo-google-fonts/space-grotesk';
import { JetBrainsMono_400Regular, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [fontsLoaded, error] = useFonts({
    Anton: Anton_400Regular,
    SpaceGrotesk: SpaceGrotesk_400Regular,
    SpaceGrotesk_SemiBold: SpaceGrotesk_600SemiBold,
    JetBrainsMono: JetBrainsMono_400Regular,
    JetBrainsMono_Bold: JetBrainsMono_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || error) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#0f0d0b" />
      <Slot />
    </SafeAreaProvider>
  );
}
