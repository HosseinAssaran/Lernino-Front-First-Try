import React from 'react';
import { ActivityIndicator, AsyncStorage, StyleSheet, Text, Alert, View, Button, TouchableOpacity, I18nManager, ScrollView, Image, ImageBackground, Dimensions, SafeAreaView, StatusBar, RefreshControl } from 'react-native';
import { createStackNavigator, DrawerNavigator } from 'react-navigation';
import { TabView, TabBar } from 'react-native-tab-view';
// import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/Ionicons';



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
    Alert.alert(fontSizeG.toString());
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
            <Text style={[styles.textCard, {fontSize : fontSizeG}]}>
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
      <Card continueHandler={this.continueHandler} image={route.image}>
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
              <MenuOption customStyles={{}}
                onSelect={() => Alert.alert('ریست درس‌ها', 'آیا مطمئن هستید که می‌خواهید درس‌ها را از اول شروع کنید؟',
                  [
                    {
                      text: 'خیر',
                      onPress: () => console.log('Cancel Pressed'),
                      style: { height: 10 },
                    },
                    {
                      text: 'بله',
                      onPress: navigation.getParam('resetCourses')
                    },
                  ],
                  //{ cancelable: false },
                )
                } text='شروع درس‌ها از اول' />
              <MenuOption onSelect={
              navigation.getParam('setFontSize')
              } >
                <Text style={{ color: 'red', height: 20 }}>سایز فونت</Text>
              </MenuOption>
              <MenuOption onSelect={() => Alert.alert('درباره', `این برنامه توسط تیم لرنینو تهیه و انتشار داده شده است. لرنینو به دنبال تحول در‌ آموزش و ساده کردن آن است. ما اعتقاد داریم باید از آموزش لذت برد.`)} disabled={false} text='درباره' />
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

  componentDidMount() {
    this.loadData();
  }

  goBack() {
    this.props.navigation.goBack();
  }

  lastTabClicked = (isLastTab) => {
    this.setState({ isLastTab: isLastTab });
    // Alert.alert(isLastTab.toString()) ;
  }

  saveItemId(itemId) {
    // lessonsIdPassed = [];  
    // AsyncStorage.setItem('itemId', JSON.stringify(lessonsIdPassed));          

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
          <StatusBar barStyle="light-content" backgroundColor="#468189" />
          {successfulLoad && this.state.data.length > 0 ?
            <TabInParts
              backToLessonHandler={this.goBack}
              isLastTabClicked={this.lastTabClicked}
              routes={this.state.data} /> :
            <View style={styles.errorView}>
              {successfulLoad ?
                <Text style={styles.errorText}>
                  {/* {this.state.data.toString} */}
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

import { MenuProvider } from 'react-native-popup-menu';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import IconMat from 'react-native-vector-icons/MaterialIcons'

import { DialogComponent } from 'react-native-dialog-component';
import { Dialog } from 'react-native-simple-dialogs';
import { MaterialDialog } from 'react-native-material-dialog';

class MyDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDialog: true,
      visible:true
    };
  }
  openDialog = (show) => {
    this.setState({ showDialog: show });
  }

  render() {
    return (
      <View style={styles.container}>
      {this.props.children}
   <MaterialDialog
  title="Use Google's Location Service?"
  visible={this.state.visible}
  onOk={() => this.setState({ visible: false })}
  onCancel={() => this.setState({ visible: false })}>
  <Text style={styles.dialogText}>
    Let Google help apps determine location. This means sending anonymous
    location data to Google, even when no apps are running.
  </Text>
</MaterialDialog>
      {/* <Dialog
        title="Custom Dialog"
        animationType="fade"
        contentStyle={
          {
            alignItems: "center",
            justifyContent: "center",
          }
        }
        onTouchOutside={() => this.openDialog(false)}
        visible={this.state.showDialog}
      >
        <Image
          source={
            {
              uri: "https://facebook.github.io/react-native/img/header_logo.png",
            }
          }
          style={
            {
              width: 99,
              height: 87,
              backgroundColor: "black",
              marginTop: 10,
              resizeMode: "contain",
            }
          }
        />
        <Text style={{ marginVertical: 30 }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Text>
        <Button
          onPress={() => this.openDialog(false)}
          style={{ marginTop: 10 }}
          title="CLOSE"
        />
      </Dialog> */}
      </View> 

    );
  }
}
import { SinglePickerMaterialDialog } from 'react-native-material-dialog';
const LIST = ['سایز ۱', 'سایز ۲', 'سایز ۳'];
var fontSizeG = 16;

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      error: [],
      isLoading: true,
      successfulLoad: false,
      singlePickerVisible: true,
      singlePickerSelectedItem: undefined,
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
      //       onPress={navigation.getParam('resetCourses')}
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
                onSelect={() => Alert.alert('ریست درس‌ها', 'آیا مطمئن هستید که می‌خواهید درس‌ها را از اول شروع کنید؟',
                  [
                    {
                      text: 'خیر',
                      onPress: () => console.log('Cancel Pressed'),
                      style: { height: 10 },
                    },
                    {
                      text: 'بله',
                      onPress: navigation.getParam('resetCourses')
                    },
                  ],
                  //{ cancelable: false },
                )
                } text='شروع درس‌ها از اول' />
              <MenuOption onSelect={
              navigation.getParam('setFontSize')
              } >
                <Text style={{ color: 'red', height: 20 }}>سایز فونت</Text>
              </MenuOption>
              <MenuOption onSelect={() => Alert.alert('درباره', `این برنامه توسط تیم لرنینو تهیه و انتشار داده شده است. لرنینو به دنبال تحول در‌ آموزش و ساده کردن آن است. ما اعتقاد داریم باید از آموزش لذت برد.`)} disabled={false} text='درباره' />
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

  componentDidMount() {
    this.loadData();
    this.loadCoursesId();
    this.props.navigation.setParams({ resetCourses: this._resetCourses });
    this.props.navigation.setParams({ setFontSize: this._showFontDialog });
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

  _showFontDialog = () => {
    this.setState({singlePickerVisible:  true});
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
       // <MyDialog>
        <View style={styles.container}>
<SinglePickerMaterialDialog
  title={'سایز فونت خود را انتخاب کنید:'}
  items={LIST.map((row, index) => ({ value: index, label: row }))}
  visible={this.state.singlePickerVisible}
  selectedItem={this.state.singlePickerSelectedItem}
  cancelLabel='لغو'
  okLabel='تایید'
  onCancel={() => this.setState({ singlePickerVisible: false })}
  onOk={result => {
    this.setState({ singlePickerVisible: false });
    this.setState({ singlePickerSelectedItem: result.selectedItem });
    fontSizeG = result.selectedItem.value * 2 + 16;
    Alert.alert(fontSizeG.toString())
  }}
/>
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
    padding: 10,
    //flex: 1,
  },
  // triggerWrapper: {
  //   backgroundColor: 'blue',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   flex: 1,
  // },
  triggerTouchable: {
    underlayColor: 'darkblue',
    activeOpacity: 70,
    style: {
      flex: 1,
    },
  },
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

