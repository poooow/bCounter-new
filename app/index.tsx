import SlideView from '@/components/slideView';
import { generateNickname } from '@/helpers/generateNickname';
import getDrinkIcon, { getNextIcon } from '@/helpers/getDrinkIcon';
import { retrieveData, updateData } from '@/helpers/storage';
import React, { JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Linking,
  Text,
  useColorScheme,
  View
} from 'react-native';
import { Menu, MenuOption, MenuOptions, MenuProvider, MenuTrigger } from 'react-native-popup-menu';
import Swiper from 'react-native-swiper';
import styles from './styles';

export interface Slide {
  count: number;
  drinks: { name: string; time: number }[],
  drinkName: string,
  icon: number,
  graph: { value: number }[],
  counterName: string,
}

const blankPerson = {
  count: 0,
  drinks: [],
  drinkName: 'Beer',
  icon: 0x1f37a,
  graph: [],
  counterName: generateNickname(),
}

export default function Home(): JSX.Element {
  const [isDarkMode, setIsDarkMode] = useState(useColorScheme() === 'dark')
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [currentSlideId, setCurrentSlideId] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([JSON.parse(JSON.stringify(blankPerson))])

  useEffect(() => {
    (async () => {
      const data = await retrieveData() as any
      data?.isDarkMode && setIsDarkMode(data.isDarkMode)
      data?.isAdvancedMode && setIsAdvancedMode(data.isAdvancedMode)
      data?.currentSlideId && setCurrentSlideId(data.currentSlideId)
      data?.slides && setSlides(data.slides)
    })();
  }, [])

  const firstUpdate = useRef(true);
  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }

    updateData({ isDarkMode, isAdvancedMode, currentSlideId, slides })
  }, [isDarkMode, isAdvancedMode, currentSlideId, slides]);

  useEffect(() => {
    const updateGraph = () => {

      if (!slides[currentSlideId]) return; // Slide with + button

      let graph = [];

      // Generates array of time differences for graph
      for (let i = 1; i < slides[currentSlideId].drinks.length; i++) {
        graph.push(slides[currentSlideId].drinks[i].time - slides[currentSlideId].drinks[i - 1].time);
      }

      let newSlides = [...slides]
      newSlides[currentSlideId].graph = graph.map((value) => ({ value }));
      setSlides(slides)
    };
    updateGraph()
  }, [slides, currentSlideId])

  const createSlide = useCallback(() => {
    // Duplicate object
    const newSlide = JSON.parse(JSON.stringify(blankPerson));
    newSlide.counterName = generateNickname()
    setSlides(current => [...current, newSlide])
  }, [])

  const deleteSlide = useCallback(() => {
    let newSlides = [...slides]
    newSlides.splice(currentSlideId, 1)
    setSlides(newSlides)
  }, [slides, currentSlideId])

  /*
   * Update counter name
   */
  const setCounterName = useCallback((name: string) => {
    let newPersons = [...slides];
    newPersons[currentSlideId].counterName = name;
    setSlides(newPersons)
  }, [slides, currentSlideId])

  /*
   * Update drink name and icon if matches keyword
   */
  const setDrinkName = useCallback((name: string) => {
    let newPersons = [...slides];
    const drinkIcon = getDrinkIcon(name);
    if (drinkIcon) newPersons[currentSlideId].icon = drinkIcon;
    newPersons[currentSlideId].drinkName = name;
    setSlides(newPersons)
  }, [slides, currentSlideId])

  /*
   * Add drink for current person
   */
  const increment = useCallback(() => {
    const currentTime = Date.now();
    
    const name = String.fromCodePoint(slides[currentSlideId].icon) + ' ' + slides[currentSlideId].drinkName;
    
    const newDrink = { 'name': name, 'time': currentTime };
    
    let newSlides = [...slides];
    newSlides[currentSlideId].count++;
    newSlides[currentSlideId].drinks.push(newDrink);
    setSlides(newSlides)
  }, [slides, currentSlideId])

  /*
   * Remove last drink for current person
   */
  const decrement = useCallback(() => {
    // Cant be less than 0 drinks
    if (slides[currentSlideId]?.count < 1) return;
    
    let newSlides = [...slides];
    newSlides[currentSlideId].count--;
    newSlides[currentSlideId].drinks.pop();
    setSlides(newSlides)
  }, [slides, currentSlideId])

  /*
   * Clear all drinks of current person
   */
  const clear = useCallback(() => {
    let newSlides = [...slides];
    newSlides[currentSlideId].count = 0;
    newSlides[currentSlideId].drinks = [];
    newSlides[currentSlideId].graph = [];
    setSlides(newSlides)
  }, [slides, currentSlideId]);

  const rotateIcon = useCallback(() => {
    setSlides(current => {
      const newSlides = [...current];
      newSlides[currentSlideId].icon = getNextIcon(newSlides[currentSlideId].icon);
      return newSlides;
    })
  }, [currentSlideId]);

  // Fill up slides Array
  const slideViews = useMemo(() => {
    const views = slides.map((slide, index) => (
      <SlideView
        key={index}
        slideId={index}
        slide={slide}
        isAdvancedMode={isAdvancedMode}
        isDarkMode={isDarkMode}
        setCounterName={setCounterName}
        setDrinkName={setDrinkName}
        increment={increment}
        decrement={decrement}
        rotateIcon={rotateIcon}
        clear={clear}
      />
    ))

    // Last slide with add-person button
    views.push(
      <View key={9999} style={styles.lastSwipe}>
        <Text onPress={createSlide} style={[styles.lastSwipeText, { color: isDarkMode ? '#666' : '#ccc' }]}>
          +
        </Text>
      </View>
    )

    return views
  }, [slides, isAdvancedMode, isDarkMode, setCounterName, setDrinkName, increment, decrement, clear, createSlide])

  return (
    <MenuProvider>
      <View style={[styles.menu, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
        <Menu>
          <MenuTrigger>
            <Text
              style={[styles.menuTrigger, { color: isDarkMode ? '#666' : '#ccc' }]}>&#x22EE;</Text>
          </MenuTrigger>
          <MenuOptions>
            <MenuOption
              onSelect={() => Linking.openURL('https://github.com/poooow/bCounter/blob/master/privacy_policy.md')}>
              <Text style={styles.menuItem}>Privacy policy</Text>
            </MenuOption>
            <MenuOption onSelect={() => setIsAdvancedMode(!isAdvancedMode)}>
              <Text style={styles.menuItem}>{isAdvancedMode ? 'Disable ' : ''}Advanced mode</Text>
            </MenuOption>
            <MenuOption onSelect={() => setIsDarkMode(!isDarkMode)}>
              <Text style={styles.menuItem}>{isDarkMode ? 'Disable ' : ''}Dark mode</Text>
            </MenuOption>
            {currentSlideId !== slides.length ?
              <MenuOption onSelect={deleteSlide}>
                <Text style={styles.menuItem}>Delete counter</Text>
              </MenuOption>
              : null}
          </MenuOptions>
        </Menu>
      </View>
      <Swiper
        containerStyle={{ backgroundColor: isDarkMode ? '#000' : '#fff' }}
        loop={false}
        index={currentSlideId}
        dot={<View style={{
          backgroundColor: isDarkMode ? '#222' : '#eee',
          width: 8,
          height: 8,
          borderRadius: 4,
          marginLeft: 3,
          marginRight: 3,
          marginTop: 3,
          marginBottom: 3,
        }} />}
        activeDot={<View style={{
          backgroundColor: isDarkMode ? '#444' : '#ccc',
          width: 8,
          height: 8,
          borderRadius: 4,
          marginLeft: 3,
          marginRight: 3,
          marginTop: 3,
          marginBottom: 3,
        }} />}
        onIndexChanged={(index: number) => setCurrentSlideId(index)}
      >
        {slideViews}
      </Swiper>
    </MenuProvider>
  );
}