// @flow

import React, { Component } from 'react';
import {
  AppRegistry,
  Text,
  View,
  Button,
  Image,
  StyleSheet,
  ListView,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { StackNavigator } from 'react-navigation';

import NavigationItem from './src/code/NavigationItem'
import api from './src/code/api'
import { screen } from './src/common'

import Swiper from 'react-native-swiper';

import RefreshListView from './src/code/widget/RefreshListView'
import RefreshState from './src/code/widget/RefreshState'
import HomeMenuItem from './src/code/widget/HomeMenuItem'
import TitleBar from './src/code/widget/TitleBar'
import BlankView from './src/code/widget/BlankView'

import TopticCell from './src/code/cell/TopticCell'
import DynamicCell from './src/code/cell/DynamicCell'
import VideoCell from './src/code/cell/VideoCell'



import WSorage from './src/sorage/WSorage'

import { AsyncStorage } from 'react-native';

import { CachedImage } from "react-native-img-cache";

var storage;

class DiscoverController extends Component {

  static navigationOptions = ({navigation}) => {
    return {
      title: '发现',
      headerRight: (
          <NavigationItem
              icon={require('././src/img/icon_news.png')}
              onPress={() => {
                alert('消息')
              }}
          />
      )
    }
  }

  state: {
      dataSource: ListView.DataSource,
      banners: Array<Object>,
  }
  constructor(props: Object) {
    super(props)

    console.log("props>> ", this.props)
    storage = WSorage._getStorage();

    let { menuInfos, onMenuSelected } = this.props

    var getSectionData = (dataBlob, sectionID) => {
        return dataBlob[sectionID];
    };

    var getRowData = (dataBlob, sectionID, rowID) => {
        return dataBlob[sectionID + ':' + rowID];
    };

    this.state = {
        banners: [],
        dataSource: new ListView.DataSource({
               getSectionData: getSectionData, // 获取组中数据
               getRowData: getRowData, // 获取行中的数据
               rowHasChanged: (r1, r2) => r1 !== r2,
               sectionHeaderHasChanged:(s1, s2) => s1 !== s2
           })
     }
  }

  // React组件的一个生命周期方法，它会在组件刚加载完成的时候调用一次，以后不再会被调用
  componentDidMount() {
    WSorage._load('index', (json) => {
      console.log("缓存 >> ",json)
      this.doFetchData(json)
    })
    // this.refs.listView.startHeaderRefreshing()
  }

  requestData() {
    fetch(api.HomdeApi,{method : 'post'})
        .then((response) => response.json())
        .then((json) => {
            // console.log(JSON.stringify(json));
            // 缓存
            WSorage._sava('index', json)
            // 处理数据
            this.doFetchData(json)
        })
        .catch((error) => {
            this.refs.listView.endRefreshing(RefreshState.Failure)
        })
  }

  doFetchData(json:Object) {
    console.log("doFetchData >> ",json)

    let bannersData = json.data.videoLayout.data.map(
        (info, i) => {
            return {
                imageUrl: info.respVideo.imageUrl,
                title: info.respVideo.brief,
                index:i,
                url:'http://www.jianshu.com'
            }
        }
    )
    let topicsData = json.data.topicListInfoLayout.data.map(
        (info) => {
            return {
                imageUrl: info.topic.img_url,
                title: info.topic.name,
                count: info.totalCountHot
            }
        }
    )
    let dynamicData = json.data.specialDynamicsLayout.data.map(
        (info) => {
            return {
                imageUrl: (info.images[0]).imageUrl,
                title: info.topicName,
                likecount: info.sumPraises,
                commitcount: info.sumDynamicComments,
            }
        }
    )
    let videoData = json.data.videoLayout.data.map(
        (info) => {
            return {
                imageUrl: info.respVideo.imageUrl,
                title: info.respVideo.brief,
                labels: info.respVideo.labelNames,
                duration: info.respVideo.duration,
            }
        }
    )

    var dataBlob = {},
    sectionIDs = [],
    rowIDs = [];

    sectionIDs = [0, 1, 2, 3, 4];

    rowIDs[0] = [0];
    rowIDs[1] = [0];

    rowIDs[2] = [0];
    dataBlob[2] = json.data.topicListInfoLayout.title;
    dataBlob[2+':'+0] = [topicsData];

    rowIDs[4] =[0];
    dataBlob[4] = json.data.specialDynamicsLayout.title;
    dataBlob[4+':'+0] = [dynamicData];

    rowIDs[3] =[];
    dataBlob[3] = json.data.videoLayout.title;
    for (var i = 0; i < videoData.length; i++) {
      rowIDs[3].push(i)
      dataBlob[3+':'+i] = videoData[i];
    }

    console.log("JSON.stringify(json)",dataBlob);

    this.setState({
        banners: bannersData,
        dataSource: this.state.dataSource.cloneWithRowsAndSections(dataBlob, sectionIDs, rowIDs)
    })
    setTimeout(() => {
        this.refs.listView.endRefreshing(RefreshState.NoMoreData)
    }, 500);
  }

  // 每一行中的数据
  renderRow(rowData:number, sectionID:number){
      return (
        <View>
           { sectionID == 0
             ?
             this.renderBanners()
             :
             (
               sectionID == 1
               ?
              this.renderMenuBar()
               :
               (
                 sectionID == 2
                 ?
                 <TopticCell toptics = {rowData} />
                 :
                 (
                   sectionID == 3
                   ?
                   <VideoCell video = {rowData} />
                   :
                   <DynamicCell dynamic = {rowData} />
                 )
               )
             )
           }
        </View>

      );
  }

  // 每一组对应的数据
  renderSectionHeader(sectionData:number,sectionId:number){
      return (
        <View >
          {
            sectionId > 1 ?
            (
              <View>
                <BlankView />
                <TitleBar title={sectionData} navi={this.props.navigation}/>
              </View>
            )
            :
            <View />
          }
        </View>
      );
  }

  render() {
    const { navigate } = this.props.navigation;

    return (
      <View style={styles.container}>
        <RefreshListView
            ref = 'listView'
            dataSource = {this.state.dataSource}
            renderSectionHeader = {this.renderSectionHeader.bind(this)}
            renderRow = {this.renderRow.bind(this)}// 下一层view中的this指向当前this
            onHeaderRefresh = {() => this.requestData()}
            removeClippedSubviews = {false}
            stickySectionHeadersEnabled = {false}
        />
      </View>
    );
  }

  renderBanners() {
    const images = this.state.banners
    var imageViews=[];
    for(var i=0;i<images.length;i++){
      let info = images[i];
      imageViews.push(
        <TouchableOpacity key={i} style={{flex:1}} activeOpacity={1}
          onPress={()=>{
            console.log("props>> 22", this.props)
            this.props.navigation.navigate('WebController', {'info': info})
          }}>
          <CachedImage style={{flex:1}} source={{uri:info.imageUrl}} />
        </TouchableOpacity>
      );
    }
    return <Swiper height={screen.width*3/7} autoplay={false}>
              {imageViews}
           </Swiper>;
  }

  renderMenuBar() {
    let menuItems = api.menuInfo.map(
        (info, i) => (
            <HomeMenuItem
                key={info.title}
                title={info.title}
                icon={info.icon}
                />
        )
    )
    return <View style={styles.itemsView} >
      {menuItems}
    </View>
  }

}

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f6f6',
        width:screen.width,
        height:screen.height
    },
    recommendHeader: {
        height: 35,
        justifyContent: 'center',
        // borderWidth: screen.onePixel,
        // borderColor: color.border,
        paddingVertical: 8,
        paddingLeft: 20,
        backgroundColor: 'white'
    },
    searchIcon: {
        width: 20,
        height: 20,
        margin: 5,
    },
    itemsView: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: screen.width,
        backgroundColor: 'white'
    },

});

export default DiscoverController;
