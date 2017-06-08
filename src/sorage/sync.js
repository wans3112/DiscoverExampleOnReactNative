/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 */
import api from '../code/api'

let  SYNC = {};
SYNC.index =(params)=>{

    if(params == null) return;
    // sync方法的名字必须和所存数据的key完全相同
    // 方法接受的参数为一整个object，所有参数从object中解构取出
    // 这里可以使用promise。或是使用普通回调函数，但需要调用resolve或reject。
      let { id, resolve, reject, syncParams: { extraFetchOptions, someFlag } } = params;
      fetch(api.HomdeApi, {
        method: 'POST',
        ...extraFetchOptions,
      }).then(response => {
        return response.json();
      }).then(json => {
        //console.log(json);
        if(json){
          // storage.save({
          //   'index': json
          // });

          if (someFlag) {
            // 根据syncParams中的额外参数做对应处理
          }

          // 成功则调用resolve
          resolve && resolve(json);
        }
        else{
          // 失败则调用reject
          reject && reject(new Error('data parse error'));
        }
      }).catch(err => {
        console.warn(err);
        reject && reject(err);
      });
}

SYNC.toplist =(params)=>{

    if(params == null) return;
    // sync方法的名字必须和所存数据的key完全相同
    // 方法接受的参数为一整个object，所有参数从object中解构取出
    // 这里可以使用promise。或是使用普通回调函数，但需要调用resolve或reject。
      let { id, resolve, reject, syncParams: { extraFetchOptions, someFlag }, page } = params;
      fetch(api.TopicListApi, {
             method: 'post',
             headers: {
                 'Accept': 'application/json',
                 'Content-Type': 'application/json' //记得加上这行，不然bodyParser.json() 会识别不了
             },
             body: JSON.stringify({
                 pageSize: "20",
                 pageNum: page
             })
          }).then(response => response.json())
            .then(json => {
                console.log(json.data);
                if(json){
                  storage.save({
                    'toplist': json
                  });

                  if (someFlag) {
                    // 根据syncParams中的额外参数做对应处理
                  }

                  // 成功则调用resolve
                  resolve && resolve(json);
                }
                else{
                  // 失败则调用reject
                  reject && reject(new Error('data parse error'));
                }
          }).catch(err => {
            console.warn(err);
            reject && reject(err);
          });
}

export default SYNC
