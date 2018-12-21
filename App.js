import React from 'react';
import { ActivityIndicator, AsyncStorage, StyleSheet, Text, View, Button, TouchableOpacity, I18nManager, Alert, ScrollView, Image, ImageBackground, Dimensions, SafeAreaView, StatusBar, RefreshControl } from 'react-native';
import { createStackNavigator, NavigationEvents } from 'react-navigation';
import { TabView, TabBar } from 'react-native-tab-view';
// import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/Ionicons';



const baseAddress = 'http://rest.lernino.com';
// const baseAddress = 'http://192.168.43.78:8000';
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
          return reject(`متاسفانه اشتباهی رخ داده ممنون میشیم بهمون اطلاع بدهید.\n (${response.status})`);
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
        style={[styles.circleButton, coursesIdPassed.indexOf(props.itemId) === -1 ? null : { backgroundColor: '#15db51' }]}
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
        style={[styles.squareButton, lessonsIdPassed.indexOf(props.itemId) === -1 ? {} : { backgroundColor: '#20ba0e' }]}
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
        >آموزش کامپیوتر (لرنینو)</Text>
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
            <Text style={styles.textCard}>
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
      name={route.icon} size={18}
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
      title: navigation.getParam('itemTitle', 'بدون عنوان'),
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
                  محتوایی برای این درس نداریم
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
                    دروس این دوره هنوز تهیه نشده است.
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
            <CircleButton onPress={() => this.navigate(itemId1, itemTitle1, itemAddress1,itemLessonsCount1)}
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
    return {
      headerTitle: <LogoTitle />,
      // headerRight: (
      //   <View>
      //     <Button
      //       onPress={navigation.getParam('resetCourses')}
      //       title='Reset'
      //     />
      //   </View>
      // ),
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
          <View style={{ backgroundColor: '#607c3a' }}>
            <Text style={styles.infoText}>
              کاری از گروه نرم افزاری فیبوک رایانه
          </Text>
          </View>
        </View>
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
        backgroundColor: '#607c3a',//'#72cdff',
      },
      headerTintColor: '#d1efa7',
      headerTitleStyle: {
        // fontWeight: 'bold',
        fontSize: 25,
        fontFamily: 'Vazir Medium',
        fontWeight: '200',
      },
    },
  }
)

export default class App extends React.Component {
  render() {
    return <RootStack />;
  }
}

const styles = StyleSheet.create({
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
    maxWidth: widthWin /5,
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
    backgroundColor: '#607c3a',
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
  contentScrollView: {
    flexGrow: 1,
    paddingVertical: 10,
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
    textAlign: 'auto',
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
    height: 35,
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

