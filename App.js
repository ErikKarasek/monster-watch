import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, SafeAreaView, StatusBar, Dimensions, Animated } from 'react-native';

const { width } = Dimensions.get('window');
const API_URL = 'http://127.0.0.1:3000/api';

const ULTRA_WHITE_IMAGE = 'https://images.alko-napoje.cz/images/3/4/0/1340/1340_monster-energy-ultra-white-500ml-p12564.jpg';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showSplash, setShowSplash] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchProducts();
    const timer = setTimeout(() => {
      setShowSplash(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: false }).start();
    }, 2000);
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: false })
      ])
    ).start();

    return () => clearTimeout(timer);
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error('API Error:', error);
      setLoading(false);
    }
  };

  const getBestRetailPrice = (product) => {
    if (!product.prices) return null;
    const retail = product.prices.filter(p => p.store?.type === 'retail');
    if (retail.length === 0) return null;
    return retail.sort((a, b) => a.price - b.price)[0];
  };

  if (showSplash) {
    return (
      <View style={styles.splash}>
        <Image source={{ uri: ULTRA_WHITE_IMAGE }} style={styles.splashImage} resizeMode="contain" />
        <Text style={styles.splashTitle}>MONSTER<Text style={{color: '#39FF14'}}>WATCH</Text></Text>
        <Text style={styles.splashStatus}>SYNCING NEON NETWORK...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MONSTER<Text style={{color: '#39FF14'}}>WATCH</Text></Text>
        <View style={styles.neonDot} />
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.label}>AKTIVNÍ VLNA SLEV (CZ)</Text>
          <View style={styles.grid}>
            {products.map((product) => {
              const best = getBestRetailPrice(product);
              return (
                <TouchableOpacity key={product.id} style={styles.card} onPress={() => setSelectedProduct(product)}>
                  <View style={styles.cardTop}>
                    <Image source={{ uri: product.imageUrl || ULTRA_WHITE_IMAGE }} style={styles.cardImage} resizeMode="contain" />
                  </View>
                  <View style={styles.cardBottom}>
                    <Text style={styles.flavor}>{product.flavor}</Text>
                    <Text style={styles.name}>{product.name}</Text>
                    <View style={styles.priceLine}>
                      <Animated.Text style={[styles.price, { transform: [{ scale: pulseAnim }] }]}>
                        {best ? `${best.price.toFixed(2)} Kč` : '---'}
                      </Animated.Text>
                      <Text style={styles.store}>{best?.store?.name || 'N/A'}</Text>
                    </View>
                  </View>
                  {best?.inFlyer && <View style={styles.flyer}><Text style={styles.flyerText}>LETÁK</Text></View>}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </Animated.View>

      {selectedProduct && (
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <TouchableOpacity style={styles.close} onPress={() => setSelectedProduct(null)}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            <Image source={{ uri: selectedProduct.imageUrl || ULTRA_WHITE_IMAGE }} style={styles.modalImage} resizeMode="contain" />
            <Text style={styles.modalTitle}>{selectedProduct.flavor}</Text>
            
            <View style={styles.list}>
              <Text style={styles.listLabel}>RETAIL NABÍDKY:</Text>
              {selectedProduct.prices?.filter(p => p.store?.type === 'retail').map((p, i) => (
                <View key={i} style={styles.row}>
                  <Text style={styles.rowStore}>{p.store?.name}</Text>
                  <Text style={styles.rowPrice}>{p.price.toFixed(2)} Kč</Text>
                </View>
              ))}
              <Text style={[styles.listLabel, {marginTop: 15}]}>DALŠÍ (WHOLESALE):</Text>
              {selectedProduct.prices?.filter(p => p.store?.type !== 'retail').map((p, i) => (
                <View key={i} style={[styles.row, {opacity: 0.6}]}>
                  <Text style={styles.rowStore}>{p.store?.name}</Text>
                  <Text style={styles.rowPriceSmall}>{p.price.toFixed(2)} Kč</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.btn} onPress={() => setSelectedProduct(null)}>
              <Text style={styles.btnText}>ZAVŘÍT</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  splash: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  splashImage: { width: 150, height: 300, marginBottom: 20 },
  splashTitle: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: 2 },
  splashStatus: { color: '#39FF14', fontSize: 10, marginTop: 10, letterSpacing: 3 },
  
  header: { padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#111' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
  neonDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#39FF14', shadowColor: '#39FF14', shadowRadius: 10, shadowOpacity: 1 },

  scroll: { padding: 15 },
  label: { color: '#444', fontSize: 10, fontWeight: 'bold', marginBottom: 20, letterSpacing: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: (width - 45) / 2, backgroundColor: '#0a0a0a', borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#151515', overflow: 'hidden' },
  cardTop: { padding: 15, backgroundColor: '#111', height: 140, justifyContent: 'center', alignItems: 'center' },
  cardImage: { width: 60, height: 120 },
  cardBottom: { padding: 12 },
  flavor: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  name: { color: '#444', fontSize: 8, marginBottom: 10 },
  priceLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { color: '#39FF14', fontSize: 16, fontWeight: '900' },
  store: { color: '#666', fontSize: 7, fontWeight: 'bold', backgroundColor: '#1a1a1a', padding: 2, borderRadius: 2 },
  flyer: { position: 'absolute', top: 10, right: 10, backgroundColor: '#BD00FF', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  flyerText: { color: '#fff', fontSize: 7, fontWeight: 'bold' },

  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: '#080808', borderRadius: 25, borderWidth: 1, borderColor: '#222', padding: 25 },
  close: { position: 'absolute', top: 20, right: 20 },
  closeText: { color: '#444', fontSize: 20 },
  modalImage: { width: 80, height: 160, alignSelf: 'center', marginBottom: 15 },
  modalTitle: { color: '#fff', fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 20 },
  list: { marginBottom: 25 },
  listLabel: { color: '#444', fontSize: 9, fontWeight: 'bold', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#151515' },
  rowStore: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  rowPrice: { color: '#39FF14', fontSize: 16, fontWeight: '900' },
  rowPriceSmall: { color: '#fff', fontSize: 14 },
  btn: { backgroundColor: '#39FF14', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#000', fontWeight: '900', letterSpacing: 1 }
});
