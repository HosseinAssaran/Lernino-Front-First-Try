
import React from 'react';
import { ActivityIndicator, Slider, AsyncStorage, StyleSheet, Text, Alert, View, Button, TouchableOpacity, TouchableHighlight, I18nManager, ScrollView, Image, ImageBackground, Dimensions, SafeAreaView, StatusBar, RefreshControl } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import { TabView, TabBar } from 'react-native-tab-view';
import Icon from 'react-native-vector-icons/Ionicons';
import { MenuProvider } from 'react-native-popup-menu';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import IconMat from 'react-native-vector-icons/MaterialIcons'
import { Dialog } from 'react-native-simple-dialogs';

const FontSizeName = ['ریز', 'معمولی', 'بزرگ', 'خیلی بزرگ'];
const baseAddress = 'http://rest.lernino.com';
//const baseAddress = 'http://192.168.1.102:8000';
const masterRelativeAddress = '/api/schools/1'
const widthWin = Dimensions.get('window').width
const heightWin = Dimensions.get('window').height

function fetchData(address) {
  return new Promise((resolve, reject) => {
    fetch(address)
      .then((response) => {
        if (response.ok) {
          return resolve(response.json());
        }
        else {
          // return reject(new Error(`متاسفانه اشتباهی رخ داده ممنون میشیم به بهمون اطلاع بدهید.\n- (${response.status}).`));
          return reject(`متاسفانه اشتباهی رخ داده ممنون میشیم درصورت استفاده از آخرین نسخه بهمون اطلاع بدهید.\n (${response.status})`);
          //reject(response.json.meta.error);
        }
      })
      .catch((error) => {
        // Alert.alert(error.message.toString());
        // return reject(new Error(`خطا در اتصال به سرور\n${error.message}`));
        return reject(`خطا در اتصال به سرور\n`);
      });
  });
}

var coursesIdPassed = [];

function CircleButton(props) {
  return (
    <View style={styles.circleButtonView}>
      <TouchableOpacity
        style={[styles.circleButton, coursesIdPassed.indexOf(props.itemId) === -1 ? null : { backgroundColor: '#3cb26f' }]}
        onPress={props.onPress}
      >
        <Image
          style={styles.imageButton}
          source={{ uri: props.value }}
        />
      </TouchableOpacity>
      <Text style={styles.circleButtonCaption}>{props.caption}</Text>
    </View>
  );
}

var lessonsIdPassed = [];

function SquareButton(props) {
  return (
    <View>
      <TouchableOpacity
        style={[styles.squareButton, lessonsIdPassed.indexOf(props.itemId) === -1 ? {} : { backgroundColor: '#3cb26f' }]}
        onPress={props.onPress}
      >
        <Text style={styles.squareButtonCaption}>{props.itemTitle}</Text>
      </TouchableOpacity>
    </View>
  );
}

class LogoTitle extends React.Component {
  render() {
    return (
      <View style={styles.header}>
        <Text style={styles.headerText}
        >مدرسه کامپیوتر لرنینو</Text>
      </View>
    );
  }
}

class Card extends React.Component {
  state = {
    screenHeight: heightWin,
    imageWidth: null,
    imageHeight: null,
  };

  onContentSizeChange = (contentWidth, contentHeight) => {
    this.setState({ screenHeight: contentHeight });
  };

  componentDidMount() {
    Image.getSize(baseAddress + this.props.image, (Width, Height) => {
      this.setState({ imageWidth: Width, imageHeight: Height / (Width / widthWin) });

    }, (errorMsg) => {
      console.log(errorMsg);
    });
  }

  render() {
    // const scrollEnabled = this.state.screenHeight > heightWin;
    const scrollEnabled = true;
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#468189" />
        <ScrollView
          style={styles.cardScrollView}
          contentContainerStyle={styles.contentScrollView}
          scrollEnabled={scrollEnabled}
          onContentSizeChange={this.onContentSizeChange}
        >
          <View style={styles.card}>
            <Text style={[styles.textCard, { fontSize: this.props.fontSize * 3 + 14 }]}>
              {this.props.children}
            </Text>
            {this.props.image &&
              <Image
                style={{ alignSelf: 'center', width: '100%', height: this.state.imageHeight - 40 }}
                source={{ uri: baseAddress + this.props.image }}
              />
            }
          </View>
          <View style={styles.buttonContainer}>
            <Button style={styles.ordinaryButton} title='ادامه' onPress={this.props.continueHandler} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

class TabInParts extends React.Component {
  constructor(props) {
    super(props);
    this.continueHandler = this.continueHandler.bind(this)
    this.state = {
      ...props,
      index: 0, //LTR

    }
  }

  continueHandler() {
    if (this.state.index < this.props.routes.length - 1) { //LTR Defualt
      this._handleIndexChange(this.state.index + 1);
    }
    else {
      this.props.backToLessonHandler();
    }

  }

  _renderScene = ({ route }) => {
    return (
      <Card continueHandler={this.continueHandler} image={route.image} fontSize={this.props.cardFontSize}>
        {route.text}
      </Card>);
  }

  _renderIcon = ({ route }) => (
    <Icon style={{ transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }] }}
      name={route.icon} size={16}
      color="white"
    />
  );

  _renderTabBar = props => {
    if (props.navigationState.routes.length > 1)
      return (
        <TabBar
          {...props}
          style={[props.navigationState.routes[0].title ? styles.tabBarWithTitle : styles.tabBar]}
          tabStyle={styles.tab}
          indicatorStyle={styles.tabIndicator}
          labelStyle={styles.tabLable}
          renderIcon={this._renderIcon}
        />
      );
    else
      return null;
  }

  _handleIndexChange = index => {
    this.setState({ index });
    if (index === this.props.routes.length - 1)
      this.props.isLastTabClicked(true);
    // else
    //   this.props.isLastTabClicked(false);
  };

  render() {
    return (
      // <View style={{ flexDirection: 'column', flex: 1}}>
      <TabView
        style={{ alignItems: 'stretch' }}
        navigationState={this.state}
        renderTabBar={this._renderTabBar}
        renderScene={this._renderScene}
        onIndexChange={this._handleIndexChange}
        initialLayout={{ height: heightWin, width: widthWin }}
      />
      // </View>
    );
  }
}

class PartsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.goBack = this.goBack.bind(this);
    this.state = {
      partsRelativeAddress: null,
      data: [],
      error: [],
      isLoading: true,
      isLastTab: false,
      successfulLoad: false,
      dialogVisible: false,
      fontSizeS: 1,
    };
  }

  static navigationOptions = ({ navigation }) => {
    return {
      headerTitleStyle: {
        fontSize: 18,
        fontFamily: 'Vazir Medium',
        fontWeight: '200',
      },
      title: navigation.getParam('itemTitle', 'بدون عنوان'),
      headerRight: (
        <View>
          <Menu>
            <MenuTrigger customStyles={triggerStyles}>
              <IconMat
                name='more-vert'
                size={24}
                color={'white'}
              />
            </MenuTrigger>
            <MenuOptions customStyles={optionsStyles}>
              <MenuOption onSelect={
                navigation.getParam('setFontSize')
              } text='اندازه قلم'
              />
            </MenuOptions>
          </Menu>
        </View>
      ),
    };
  };

  loadData() {
    this.setState({ isLoading: true });
    fetchData(baseAddress + partsRelativeAddress)
      .then(((parsedRes) => this.setState({ data: parsedRes, isLoading: false, successfulLoad: true })),
        ((rejectedRes) => this.setState({ error: rejectedRes, isLoading: false, successfulLoad: false }))
      );
  }

  loadFontSize = async () => {
    try {
      const fontSizeStored = await AsyncStorage.getItem('fontSizeStored');
      if (fontSizeStored != null) {
        const fontSizeParsed = parseInt(fontSizeStored, 10);
        this.setState({ fontSizeS: fontSizeParsed });
        //Alert.alert(this.state.fontSizeS.toString());
      }
      else {
        //Alert.alert('Font Size Not Stored.');
      }
    }
    catch (error) {
      //Alert.alert('Error in reading font size.');
      Alert.alert(error.toString());
    }
  }

  storeFontSize = async (value) => {
    try {
      const fontSize = value;
      await AsyncStorage.setItem('fontSizeStored', fontSize.toString());
      //Alert.alert(fontSize.toString())
    } catch (error) {
      Alert.alert('Error in storing Font Size.')
      // Error saving data
    }
  };

  componentDidMount() {
    this.loadData();
    this.loadFontSize();
    this.props.navigation.setParams({ setFontSize: this.showFontDialog });
  }

  showFontDialog = () => {
    this.setState({ dialogVisible: true });
  }

  goBack() {
    this.props.navigation.goBack();
  }

  lastTabClicked = (isLastTab) => {
    this.setState({ isLastTab: isLastTab });
    // Alert.alert(isLastTab.toString()) ;
  }

  saveItemId(itemId) {          
    if (lessonsIdPassed.indexOf(itemId) === -1) {
      lessonsIdPassed.push(itemId)
      AsyncStorage.setItem('itemId', JSON.stringify(lessonsIdPassed));
      this.props.navigation.state.params.refresh();
    }
    else
      console.log("This item already exists");
  }

  componentWillUnmount() {
    itemId = this.props.navigation.getParam('itemId', 0);
    if (this.state.isLastTab === true || this.state.data.length === 1) {
      this.saveItemId(itemId);
      // Alert.alert(itemId.toString());    
    }
  }

  render() {
    const successfulLoad = this.state.successfulLoad;
    const isLoading = this.state.isLoading;
    const { navigation } = this.props;
    partsRelativeAddress = navigation.getParam('itemAddress', 'Null');

    if (isLoading)
      return (
        <View style={[styles.activityIndicator]}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      );
    else
      return (
        <View style={[styles.container]}>
          <Dialog
            visible={this.state.dialogVisible}
            title="اندازه قلم"
            titleStyle={{ fontSize: 20, fontFamily: 'Vazir Medium', fontWeight: '200', }}
            onTouchOutside={() => this.setState({ dialogVisible: false })}
            onRequestClose={() => this.setState({ dialogVisible: false })}
          >
            <View style={{
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Text style={{ fontSize: this.state.fontSizeS  * 3 + 14, fontFamily: 'Vazir Medium', fontWeight: '200', }}>
                {FontSizeName[this.state.fontSizeS]}
              </Text>
              <View style={{flexDirection: 'row'}}>
              <Text style={{ fontSize: 23, fontFamily: 'Vazir Medium', fontWeight: '200', alignSelf: 'center'  }}>آ</Text>
              <Slider
                style={{ width: '80%', height: 50 }}
                thumbTouchSize={{ width: 50, height: 40 }}
                maximumValue={3}
                value={this.state.fontSizeS}
                step={1}
                onValueChange={(value) => {
                  this.setState({ fontSizeS: value });
                  this.storeFontSize(value);
                }}              
              //maximumTrackTintColor='#45f330'
              //thumbTintColor ='#45f330'
              />
              <Text style={{ fontSize: 14, fontFamily: 'Vazir Medium', fontWeight: '200', alignSelf: 'center' }}>آ</Text>             
               </View>
              <TouchableOpacity
                style={{ justifyContent: 'flex-start', alignSelf: 'flex-end' }}
                onPress={() => this.setState({ dialogVisible: false })}
              >
                <Text style={{fontSize: 14, fontFamily: 'Vazir Medium', fontWeight: '200', paddingHorizontal: 20, paddingVertical: 10}}>تایید</Text>
              </TouchableOpacity>
            </View>
          </Dialog>
          <StatusBar barStyle="light-content" backgroundColor="#468189" />
          {successfulLoad && this.state.data.length > 0 ?
            <TabInParts
              backToLessonHandler={this.goBack}
              isLastTabClicked={this.lastTabClicked}
              cardFontSize={this.state.fontSizeS}
              routes={this.state.data} /> :
            <View style={styles.errorView}>
              {successfulLoad ?
                <Text style={styles.errorText}>
                  برای این درس هنوز محتوایی تهیه نشده است. از شکیبایی شما سپاسگزاریم.
                </Text>
                :
                <View>
                  <Text style={styles.errorText}>
                    {this.state.error.toString()}
                  </Text>
                  <Button style={styles.ordinaryButton}
                    title='تلاش دوباره' onPress={() => this.loadData()}
                  />
                </View>
              }
            </View>
          }
        </View>
      );
  }
}

class LessonsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lessonsRelativeAddress: null,
      data: [],
      error: [],
      isLoading: true,
      successfulLoad: false,
    };
  }

  renderSquares = (squareDetails) => {
    var SquareButtons = [];
    let i = 0;
    while (i < squareDetails.length - 1) {
      const itemId1 = squareDetails[i].id;
      const itemTitle1 = squareDetails[i].title;
      const itemAddress1 = squareDetails[i].relative_address;

      const itemId2 = squareDetails[i + 1].id;
      const itemTitle2 = squareDetails[i + 1].title;
      const itemAddress2 = squareDetails[i + 1].relative_address;

      SquareButtons.push(
        <View key={i} style={styles.squareButtonRowView}>
          <SquareButton onPress={() => this.navigate(itemId1, itemTitle1, itemAddress1)}
            itemTitle={itemTitle1} itemId={itemId1} />
          <SquareButton onPress={() => this.navigate(itemId2, itemTitle2, itemAddress2)}
            itemTitle={itemTitle2} itemId={itemId2} />
        </View>
      );
      i += 2;
    }
    if (squareDetails.length % 2 == 1) {
      const itemId = squareDetails[i].id;
      const itemTitle = squareDetails[i].title;
      const itemAddress = squareDetails[i].relative_address;

      SquareButtons.push(
        <View key={i} style={styles.squareButtonRowView}>
          <SquareButton onPress={() => this.navigate(itemId, itemTitle, itemAddress)}
            itemTitle={itemTitle} itemId={itemId} />
        </View>
      );
      i++;
    }
    return (
      SquareButtons
    );
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('itemTitle', 'بدون عنوان'),
    };
  }

  _rerender = () => {
    this.setState({});
    // Alert.alert('lesson is paseed.');    
  }

  navigate = (itemId, itemTitle, itemAddress) => {
    this.props.navigation.push('Parts', {
      itemId: itemId,
      itemTitle: itemTitle,
      itemAddress: itemAddress,
      refresh: this._rerender,
    })
  }

  loadData() {
    this.setState({ isLoading: true });
    fetchData(baseAddress + lessonsRelativeAddress)
      .then(((parsedRes) => this.setState({ data: parsedRes, isLoading: false, successfulLoad: true })),
        ((rejectedRes) => this.setState({ error: rejectedRes, isLoading: false, successfulLoad: false }))
      );
  }

  componentDidMount() {
    this.loadData();
    this.loadLessonsId();
  }

  loadLessonsId = async () => {
    try {
      const itemIds = await AsyncStorage.getItem('itemId');
      if (itemIds != null)
        lessonsIdPassed = JSON.parse(itemIds);
      // Alert.alert(itemIds);
    }
    catch (error) {
      // Alert.alert(error)
    }
  }

  saveCourseId(itemId) {
    if (coursesIdPassed.indexOf(itemId) === -1) {
      coursesIdPassed.push(itemId)
      AsyncStorage.setItem('courseItemId', JSON.stringify(coursesIdPassed));
      this.props.navigation.state.params.refresh();
    }
    else
      console.log("This item already exists");
  }

  _onRefresh = () => {
    this.loadData();
    this.loadLessonsId();
  }

  componentWillUnmount() {
    let itemId = this.props.navigation.getParam('itemId', 0);
    let lessonsCount = this.props.navigation.getParam('itemLessonsCount', 0);
    if (coursesIdPassed.indexOf(itemId) === -1) {
      let coursePassed = false;
      let countLessonPassed = 0;
      for (let data of this.state.data) {
        if (lessonsIdPassed.indexOf(data.id) != -1) {
          countLessonPassed++;
        }
      }
      if (countLessonPassed === lessonsCount && lessonsCount != 0) {//this.state.data.length && this.state.data.length != 0) {
        coursePassed = true;
        Alert.alert('تبریک!', 'شما این دوره رو با موفقیت گذروندید.');
      }
      // Alert.alert('You Passed ' + countLessonPassed.toString() + ' Of ' + this.state.data.length.toString());    
      if (coursePassed === true) {
        this.saveCourseId(itemId);
      }
    }
  }

  render() {
    const { navigation } = this.props;
    const isLoading = this.state.isLoading;
    const successfulLoad = this.state.successfulLoad;
    lessonsRelativeAddress = navigation.getParam('itemAddress', 'Null');

    if (successfulLoad == true)
      var Lessons = this.renderSquares(this.state.data);

    if (isLoading == true)
      return (
        <View style={[styles.activityIndicator]}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      );
    else
      return (
        <View style={[styles.container, styles.lessonContainer]}>
          <StatusBar barStyle="light-content" backgroundColor="#468189" />
          <ScrollView
            contentContainerStyle={styles.contentScrollView}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={this._onRefresh}
              />
            }
          >
            {successfulLoad && this.state.data.length > 0 ? Lessons
              : successfulLoad ?
                <View style={styles.errorView}>
                  <Text style={styles.errorText}>
                    دروس این دوره هنوز تهیه نشده است. از شکیبایی شما سپاسگزاریم.
                </Text>
                </View>
                :
                <View style={styles.errorView}>
                  <Text style={styles.errorText}>>
                    {this.state.error.toString()}
                  </Text>
                  <Button style={styles.ordinaryButton}
                    title='تلاش دوباره' onPress={() => this.loadData()}
                  />
                </View>
            }
          </ScrollView>
        </View>
      );
  }
}
class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      error: [],
      isLoading: true,
      successfulLoad: false,
      aboutDialogVisible: false,
      resourceDialogVisible: false,
      resetCoursesDialogVisible : false,
    };
  }

  renderCircle = (circleDetails) => {
    var CircleButtons = [];
    const { props } = this;
    let i = 0;
    while (i < circleDetails.length) {
      if (circleDetails[i].number_in_row == 1) {
        const itemId = circleDetails[i].id;
        const itemTitle = circleDetails[i].title;
        const itemAddress = circleDetails[i].relative_address;
        const itemIconAddress = circleDetails[i].icon;
        const itemLessonsCount = circleDetails[i].lessons_count;
        CircleButtons.push(
          <View key={i} style={styles.circleButtonRowView}>
            <CircleButton onPress={() => this.navigate(itemId, itemTitle, itemAddress, itemLessonsCount)}
              value={baseAddress + itemIconAddress} caption={itemTitle} id={i} itemId={itemId} />
          </View>
        );
        i++;
      }
      else if (circleDetails[i].number_in_row == 2) {
        const itemId1 = circleDetails[i].id;
        const itemTitle1 = circleDetails[i].title;
        const itemAddress1 = circleDetails[i].relative_address;
        const itemIconAddress1 = circleDetails[i].icon;
        const itemLessonsCount1 = circleDetails[i].lessons_count;
        let itemId2 = 0;
        let itemTitle2 = 'None';
        let itemAddress2 = '';
        let itemIconAddress2 = null;
        let itemLessonsCount2 = 0;
        if (circleDetails[i + 1]) {
          itemId2 = circleDetails[i + 1].id;
          itemTitle2 = circleDetails[i + 1].title;
          itemAddress2 = circleDetails[i + 1].relative_address;
          itemIconAddress2 = circleDetails[i + 1].icon;
          itemLessonsCount2 = circleDetails[i + 1].lessons_count;
        }
        CircleButtons.push(
          <View key={i} style={styles.circleButtonRowView}>
            <CircleButton onPress={() => this.navigate(itemId1, itemTitle1, itemAddress1, itemLessonsCount1)}
              value={baseAddress + itemIconAddress1} caption={itemTitle1} id={i} itemId={itemId1} />
            <CircleButton onPress={() => this.navigate(itemId2, itemTitle2, itemAddress2, itemLessonsCount2)}
              value={baseAddress + itemIconAddress2} caption={itemTitle2} id={i} itemId={itemId2} />
          </View>
        );
        i += 2;
      }
      else if (circleDetails[i].number_in_row == 3) {
        const itemId1 = circleDetails[i].id;
        const itemTitle1 = circleDetails[i].title;
        const itemAddress1 = circleDetails[i].relative_address;
        const itemIconAddress1 = circleDetails[i].icon;
        const itemLessonsCount1 = circleDetails[i].lessons_count;
        let itemId2 = 0;
        let itemTitle2 = 'None';
        let itemAddress2 = '';
        let itemIconAddress2 = null;
        let itemLessonsCount2 = 0;
        let itemId3 = 0;
        let itemTitle3 = 'None';
        let itemAddress3 = '';
        let itemIconAddress3 = null;
        let itemLessonsCount3 = 0;

        if (circleDetails[i + 1]) {
          itemId2 = circleDetails[i + 1].id;
          itemTitle2 = circleDetails[i + 1].title;
          itemAddress2 = circleDetails[i + 1].relative_address;
          itemIconAddress2 = circleDetails[i + 1].icon;
          itemLessonsCount2 = circleDetails[i + 1].lessons_count;
        }
        if (circleDetails[i + 2]) {
          itemId3 = circleDetails[i + 2].id;
          itemTitle3 = circleDetails[i + 2].title;
          itemAddress3 = circleDetails[i + 2].relative_address;
          itemIconAddress3 = circleDetails[i + 2].icon;
          itemLessonsCount3 = circleDetails[i + 2].lessons_count;
        }

        CircleButtons.push(
          <View key={i} style={styles.circleButtonRowView}>
            <CircleButton onPress={() => this.navigate(itemId1, itemTitle1, itemAddress1, itemLessonsCount1)}
              value={baseAddress + itemIconAddress1} caption={itemTitle1} id={i} itemId={itemId1} />
            <CircleButton onPress={() => this.navigate(itemId2, itemTitle2, itemAddress2, itemLessonsCount2)}
              value={baseAddress + itemIconAddress2} caption={itemTitle2} id={i} itemId={itemId2} />
            <CircleButton onPress={() => this.navigate(itemId3, itemTitle3, itemAddress3, itemLessonsCount3)}
              value={baseAddress + itemIconAddress3} caption={itemTitle3} id={i} itemId={itemId3} />
          </View>
        );
        i += 3;
      }
    }
    return (
      CircleButtons
    );
  }

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerTitle: <LogoTitle />,
      //drawerLabel: 'Home',
      // drawerIcon: ({ tintColor }) => (
      //   <Image
      //     source={require('./chats-icon.png')}
      //     style={[styles.icon, {tintColor: tintColor}]}
      //   />),
      // headerLeft: (
      //   <View>
      //     <Button
      //       onPress={navigation.getParam('resetFontSize')}
      //       title='Reset'
      //     />
      //   </View>
      // ),
      headerRight: (
        <View>
          <Menu>
            <MenuTrigger customStyles={triggerStyles}>
              <IconMat
                name='more-vert'
                size={24}
                color={'white'}
              />
            </MenuTrigger>
            <MenuOptions customStyles={optionsStyles}>
              <MenuOption customStyles={{}}
                onSelect={navigation.getParam('showResetCoursesDialog')
                //   () => Alert.alert('شروع درس‌ها از اول', 'آیا مطمئن هستید که می‌خواهید درس‌ها را از اول شروع کنید؟',
                //   [
                //     {
                //       text: 'خیر',
                //       onPress: () => console.log('Cancel Pressed'),
                //       style: { height: 10 },
                //     },
                //     {
                //       text: 'بله',
                //       style: { height: 10 },
                //       onPress: navigation.getParam('resetCourses')
                //     },
                //   ],
                //   //{ cancelable: false },
                // )
                } text='شروع درس‌ها از اول'
                textStyle={{ fontSize: 14, fontFamily: 'Vazir Medium', fontWeight: '200' }} />
              <MenuOption onSelect={navigation.getParam('showResourceDialog')
              //   () => Alert.alert('منابع', '1. https://www.pcmag.com\n2. https://en.wikipedia.org\n3. https://tutorialspoint.com',
              //   [
              //     {
              //       text: 'تایید',
              //       onPress: () => console.log('Confirm Pressed'),
              //       style: { height: 10 , justifyContent: 'felx-start'},
              //     },
              //   ]
              // )
            }
                disabled={false} text='منابع مورد استفاده' />
              <MenuOption onSelect={navigation.getParam('showAboutDialog')
              //Alert.alert('درباره', `این برنامه توسط تیم لرنینو تهیه و انتشار داده شده است. لرنینو به دنبال تحول در‌ آموزش و ساده کردن آن است. ما اعتقاد داریم باید از آموزش لذت برد.`,
                // [
                //   {
                //     text: 'تایید',
                //     onPress: () => console.log('Confirm Pressed'),
                //     style: { height: 10 },
                //   },
                // ])
              }
                disabled={false} text='درباره' />
            </MenuOptions>
          </Menu>
        </View>
      ),
    };
  };

  _rerender = () => {
    this.setState({});
    // Alert.alert('course is paseed.')
  }

  navigate = (itemId, itemTitle, itemAddress, itemLessonsCount) => {
    this.props.navigation.push('Lessons', {
      itemId: itemId,
      itemTitle: itemTitle,
      itemAddress: itemAddress,
      itemLessonsCount: itemLessonsCount,
      refresh: this._rerender,
    })
  }

  loadData() {
    this.setState({ isLoading: true });
    fetchData(baseAddress + masterRelativeAddress)
      .then(((parsedRes) => this.setState({ data: parsedRes, isLoading: false, successfulLoad: true })),
        ((rejectedRes) => this.setState({ error: rejectedRes, isLoading: false, successfulLoad: false }))
      );
  }

  _showAboutDialog = () => {
    this.setState({ aboutDialogVisible: true });
  }

  _showResourceDialog = () => {
    this.setState({ resourceDialogVisible: true });
  }

  _showResetCoursesDialog = () => {
    this.setState({ resetCoursesDialogVisible: true });
  }

  componentDidMount() {
    this.loadData();
    this.loadCoursesId();
    this.props.navigation.setParams({ resetCourses: this._resetCourses });
    this.props.navigation.setParams({ resetFontSize: this._resetFontSize });
    this.props.navigation.setParams({ showAboutDialog: this._showAboutDialog });
    this.props.navigation.setParams({ showResourceDialog: this._showResourceDialog });
    this.props.navigation.setParams({ showResetCoursesDialog: this._showResetCoursesDialog });
  }

  loadCoursesId = async () => {
    try {
      const itemIds = await AsyncStorage.getItem('courseItemId');
      if (itemIds != null)
        coursesIdPassed = JSON.parse(itemIds);
      // Alert.alert(itemIds);
    }
    catch (error) {
      // Alert.alert(error)
    }
  }

  _onRefresh = () => {
    this.loadData();
    this.loadCoursesId();
  }

  _resetCourses = () => {
    coursesIdPassed = [];
    AsyncStorage.setItem('courseItemId', JSON.stringify(coursesIdPassed));
    lessonsIdPassed = [];
    AsyncStorage.setItem('itemId', JSON.stringify(lessonsIdPassed));
    this.setState({});
  };

  _resetFontSize = () => {
    AsyncStorage.removeItem('fontSizeStored');
  }

  render() {
    const { navigation } = this.props;
    const successfulLoad = this.state.successfulLoad;
    const isLoading = this.state.isLoading;
    if (successfulLoad == true)
      var Courses = this.renderCircle(this.state.data, navigation);

    if (isLoading == true) {
      return (
        <View style={[styles.activityIndicator]}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      );
    }
    else
      return (
        <View style={styles.container}>
                 <Dialog
                  visible={this.state.resetCoursesDialogVisible}
                  title="شروع درس‌ها از اول"
                  titleStyle={{ fontSize: 20, fontFamily: 'Vazir Medium', fontWeight: '200', }}
                  onTouchOutside={() => this.setState({ resetCoursesDialogVisible: false })}
                  onRequestClose={() => this.setState({ resetCoursesDialogVisible: false })}
                >
                  <View style={{
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Text style={{ fontSize: 14, fontFamily: 'Vazir Medium', fontWeight: '200', }}>
                    آیا مطمئن هستید که می‌خواهید درس‌ها را از اول شروع کنید؟
                    </Text>
                    <View style={{flexDirection:'row', alignSelf: 'flex-end' }}>
                    <TouchableOpacity
                      style={{ justifyContent: 'flex-start', alignSelf: 'flex-end' }}
                      onPress={() => {
                        this._resetCourses();
                        this.setState({ resetCoursesDialogVisible: false })
                        }
                      }
                    >
                      <Text style={{fontSize: 14, fontFamily: 'Vazir Medium', fontWeight: '200', paddingHorizontal: 20, paddingVertical: 10}}>بله</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ justifyContent: 'flex-start', alignSelf: 'flex-end' }}
                      onPress={() => this.setState({ resetCoursesDialogVisible: false })}
                    >
                      <Text style={{fontSize: 14, fontFamily: 'Vazir Medium', fontWeight: '200', paddingHorizontal: 20, paddingVertical: 10}}>خیر</Text>
                    </TouchableOpacity>
                    </View>
                  </View>
                </Dialog>
                  <Dialog
                  visible={this.state.resourceDialogVisible}
                  title="منابع"
                  titleStyle={{ fontSize: 20, fontFamily: 'Vazir Medium', fontWeight: '200', }}
                  onTouchOutside={() => this.setState({ resourceDialogVisible: false })}
                  onRequestClose={() => this.setState({ resourceDialogVisible: false })}
                >
                  <View style={{
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Text style={{ fontSize: 14, fontFamily: 'Vazir Medium', fontWeight: '200', }}>
                    1. https://www.pcmag.com 
                    2.https://en.wikipedia.org
                    3.https://tutorialspoint.com'
                    </Text>
                    <TouchableOpacity
                      style={{ justifyContent: 'flex-start', alignSelf: 'flex-end' }}
                      onPress={() => this.setState({ resourceDialogVisible: false })}
                    >
                      <Text style={{fontSize: 14, fontFamily: 'Vazir Medium', fontWeight: '200', paddingHorizontal: 10, paddingVertical: 10}}>تایید</Text>
                    </TouchableOpacity>
                  </View>
                </Dialog>
                  <Dialog
                  visible={this.state.aboutDialogVisible}
                  title="درباره"
                  titleStyle={{ fontSize: 20, fontFamily: 'Vazir Medium', fontWeight: '200', }}
                  onTouchOutside={() => this.setState({ aboutDialogVisible: false })}
                  onRequestClose={() => this.setState({ aboutDialogVisible: false })}
                >
                  <View style={{
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Text style={{ fontSize: 14, fontFamily: 'Vazir Medium', fontWeight: '200', }}>
                    این برنامه توسط تیم لرنینو تهیه و انتشار داده شده است. لرنینو به دنبال تحول در‌ آموزش و ساده کردن آن است. ما اعتقاد داریم باید از آموزش لذت برد
                    </Text>
                    <TouchableOpacity
                      style={{ justifyContent: 'flex-start', alignSelf: 'flex-end' }}
                      onPress={() => this.setState({ aboutDialogVisible: false })}
                    >
                      <Text style={{fontSize: 14, fontFamily: 'Vazir Medium', fontWeight: '200', paddingHorizontal: 20, paddingVertical: 10}}>تایید</Text>
                    </TouchableOpacity>
                  </View>
                </Dialog>
          <StatusBar barStyle="light-content" backgroundColor="#468189" />
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentScrollView}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={this._onRefresh}
              />
            }
          >
            {successfulLoad ? Courses :
              <View style={styles.errorView}>
                <Text style={styles.errorText} >
                  {this.state.error.toString()}
                </Text>
                <Button style={styles.ordinaryButton}
                  title='تلاش دوباره' onPress={() => this.loadData()}
                />
              </View>}
          </ScrollView>
          {/* <View style={{ backgroundColor: '#607c3a' }}>
            <Text style={styles.infoText}>
              کاری از گروه نرم افزاری فیبوک رایانه
          </Text>
          </View> */}
        </View>
        // </MyDialog>
      );
  }
}

const RootStack = createStackNavigator(
  {
    Home: HomeScreen,
    Lessons: LessonsScreen,
    Parts: PartsScreen,
  }
  ,
  {
    initialRouteName: 'Home',
    headerLayoutPreset: 'center',
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#4c6d66',//'#72cdff',
      },
      headerTintColor: '#d1efa7',
      headerTitleStyle: {
        // fontWeight: 'bold',
        fontSize: 20,
        fontFamily: 'Vazir Medium',
        fontWeight: '200',
      },
    },
  }
)

const triggerStyles = {
  triggerText: {
    color: 'white',
  },
  triggerOuterWrapper: {
    //backgroundColor: 'orange',
    alignItems: 'center',
    padding: 2,
    //flex: 1,
  },
  triggerWrapper: {
    //   backgroundColor: 'blue',
    alignItems: 'center',
    justifyContent: 'center',
  },
  TriggerTouchableComponent: TouchableHighlight,
  triggerTouchable: {
    title: 'buttonText ',
    //underlayColor: 'darkblue',
    activeOpacity: 0.70,
    style: {
      //flex: 1,
      //padding: 10,
      alignItems: 'center',
      justifyContent: 'center',
      width: 40,
      height: 40,
      borderRadius: 20,
      // borderColor: '#05c13e',
      // borderWidth: 1.5,
    },
  }
};

const optionsStyles = {
  optionsContainer: {
    //backgroundColor: 'green',
    padding: 5,
  },
  optionsWrapper: {
    //backgroundColor: 'purple',
  },
  optionWrapper: {
    //backgroundColor: 'yellow',
    margin: 5,
  },
  optionTouchable: {
    underlayColor: 'gold',
    activeOpacity: 70,
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Vazir Medium',
    fontWeight: '200',
    //color: 'brown',
  },
};

const optionStyles = {
  optionTouchable: {
    underlayColor: 'red',
    activeOpacity: 40,
  },
  optionWrapper: {
    backgroundColor: 'pink',
    margin: 5,
  },
  optionText: {
    color: 'black',
  },
};

// class SideMenu extends React.Component {
//   navigateToScreen = (route) => () => {
//     const navigateAction = NavigationActions.navigate({
//       routeName: route
//     });
//     this.props.navigation.dispatch(navigateAction);
//   }

//   render() {
//     return (
//       <View style={styles.container1}>
//         <ScrollView>
//           <View>
//             <Text style={styles.sectionHeadingStyle}>
//               Section 1
//             </Text>
//             <View style={styles.navSectionStyle}>
//               <Text style={styles.navItemStyle} onPress={this.navigateToScreen('Page1')}>
//                 تنظیم فونت
//               </Text>
//             </View>
//           </View>
//           <View>
//             <Text style={styles.sectionHeadingStyle}>
//               Section 2
//             </Text>
//             <View style={styles.navSectionStyle}>
//               <Text style={styles.navItemStyle} onPress={this.navigateToScreen('Page2')}>
//                 Page2
//               </Text>
//               <Text style={styles.navItemStyle} onPress={this.navigateToScreen('Page3')}>
//                 Page3
//               </Text>
//             </View>
//           </View>
//           <View>
//             <Text style={styles.sectionHeadingStyle}>
//               Section 3
//             </Text>
//             <View style={styles.navSectionStyle}>
//               <Text style={styles.navItemStyle} onPress={this.navigateToScreen('Page4')}>
//                 Page4
//               </Text>
//             </View>
//           </View>
//         </ScrollView>
//         <View style={styles.footerContainer}>
//           <Text>This is my fixed footer</Text>
//         </View>
//       </View>
//     );
//   }
// }
// import PropTypes from 'prop-types';

// SideMenu.propTypes = {
//   navigation: PropTypes.object
// };

// const DrawerNav = DrawerNavigator({
//   Item1: {
//     screen: RootStack,
//   }
// }, {
//     contentComponent: SideMenu,
//     drawerWidth: Dimensions.get('window').width - 120,
//   });

export default class App extends React.Component {
  render() {
    return (
      <MenuProvider>
        <RootStack />
      </MenuProvider>
    );
  }
}

const styles = StyleSheet.create({
  // navItemStyle: {
  //   padding: 10
  // },
  // navSectionStyle: {
  //   backgroundColor: 'lightgrey'
  // },
  // sectionHeadingStyle: {
  //   paddingVertical: 10,
  //   paddingHorizontal: 5
  // },
  // footerContainer: {
  //   padding: 20,
  //   backgroundColor: 'lightgrey'
  // },
  container: {
    flex: 1,
    // direction: 'rtl',
    // borderColor: '#000000',
    borderWidth: 0,
    margin: 0,
    backgroundColor: '#caf7e2',
  },
  lessonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center'
  },
  scrollView: {
    flex: 1,
    // marginTop: 10,
    width: '100%',
    alignContent: 'center'
  },
  contentScrollView: {
    //flexGrow: 1,
    paddingVertical: 10,
  },
  circleButton: {
    alignItems: 'center',
    backgroundColor: '#83a7a8',//'#15db51',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderColor: '#05c13e',
    borderWidth: 1.5,
  },
  circleButtonView: {
    alignItems: 'center',
    maxWidth: widthWin / 5,
  },
  circleButtonCaption: {
    alignSelf: 'center',
    textAlign: 'center',
    marginBottom: 10,
    color: 'gray',
    fontFamily: 'Vazir Medium'
  },
  circleButtonRowView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly'
  },
  imageButton: {
    width: 60,
    height: 60,
  },
  squareButton: {
    alignItems: 'center',
    backgroundColor: '#4c6d66',
    justifyContent: 'center',
    width: 150,
    height: 150,
    margin: 10,
    borderColor: '#B7E1C4',
    borderWidth: 1.5,
  },
  squareButtonCaption: {
    alignSelf: 'center',
    marginBottom: 10,
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Vazir Medium'
  },
  squareButtonRowView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly'
  },

  card: {
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 20,
    minHeight: 10,
    minWidth: widthWin - 20,
    margin: 10
  },
  textCard: {
    textAlign: 'justify',
    fontSize: 16,
    marginBottom: 5,
    color: "#4A4A4A",
    fontFamily: 'Vazir Medium'
  },
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10
  },
  tab: {
    alignSelf: 'stretch',
    padding: 0,
  },
  tabIndicator: {
    backgroundColor: 'white'
  },
  tabBar: {
    height: 28,
  },
  tabBarWithTitle: {
    height: 'auto',
  },
  tabLable: {
    fontFamily: 'Vazir Medium'
  },
  buttonContainer: {
    width: 100,
    height: 20,
    margin: 10,
    marginBottom: 30,
    alignSelf: 'flex-end'
  },
  headerText: {
    fontSize: 25,
    // fontWeight: 'bold',
    color: '#d1efa7',
    fontFamily: 'Vazir Medium'
  },
  header: {
    flexGrow: 1,
    width: null,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  cardScrollView: {
    // flexDirection: 'column', 
    // flex: 1,
  },
  errorText: {
    color: 'gray',
    textAlign: 'center',
    fontFamily: 'Vazir Medium'
  },
  errorView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ordinaryButton: {
    width: 50,
  },
  infoText: {
    alignSelf: 'center',
    color: 'white',
    fontFamily: 'Vazir Medium'
  }
});