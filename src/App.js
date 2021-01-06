import React, { useState, useEffect } from 'react';
import './App.css';

export const API = 'jkUWxcNASMvcAkZHF5gjCe2IGh15ybHZ';
export const WEB = 'http://dataservice.accuweather.com/';

export const locationApiUrl = () => `${WEB}locations/v1/topcities/150?apikey=${API}`;
export const weatherApiUrl = keyC => `${WEB}forecasts/v1/daily/5day/${keyC}?apikey=${API}`;

export default function App() {

  const [ defaultCity, setDefaultCity ] = useState({
    name: 'Tel Aviv',
    temp: 0,
    fiveDays: [
      {
        day: '',
        temp: 0,
      },
    ],
  });

  const [ term, setTerm ] = useState('');
  const [ visibleItem, setVisibleItem ] = useState('');
  const [ key, setKey ] = useState(215854);
  const [ favorites, setFavorites ] = useState([]);

  const [ homeFlag, setHomeFlag ] = useState(true);
  const [ favFlag, setFavFlag ] = useState(false);

  const [ cls, setCls ] = useState("table-primary");
  const [ autocompleteFlag, setAutocompleteFlag ] = useState(true);

  const search = (info, term) => {
    
    const searcher = info.filter(item => {
    
      if (term.length === 0) {
        return info;
      }
      return item.LocalizedName.toLowerCase().indexOf(term.toLowerCase()) > -1;
    });

    let visible, key;

    if (searcher.length === 0) {
      visible = 'Tel Aviv';
      key = 215854;
    }
    else {
      visible = searcher[ 0 ].LocalizedName;
      key = searcher[ 0 ].Key
    }
    setVisibleItem(visible);
    setKey(key);
  }
 
  const onSearch = (e) => {

    setTerm(() => e.target.value);
    setAutocompleteFlag(true);

    const fav = (el) => el.name === defaultCity.name;

    if (favorites.some((el) => fav(el))) {
      setCls("table-active")
    }
    else {
      setCls("table-primary");
    }
  }

  const addToFavorites = (defaultCity) => {

    const fav = (el) => el === defaultCity;
    
    if (favorites.some((el) => fav(el))) {
      setFavorites(favorites)
    }
    
    else {
      setFavorites([ ...favorites, defaultCity ]);
      setCls("table-active")
    }
    
  }

  const renderWeather = (res) => {
    const week = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
    let date, dayName, dailyWeather, c, arr = [];

    for (let i = 0; i < 5; i++) {

      date = new Date(res.DailyForecasts[ i ].Date);
      
      dayName = week[ date.getDay() ];

      dailyWeather = res.DailyForecasts[ i ].Temperature;
      c = (dailyWeather.Maximum.Value - 32) * 5 / 9;

      arr.push({ day: dayName, temp: (c).toFixed() })
    }

    dailyWeather = res.DailyForecasts[ 0 ].Temperature;
    c = (dailyWeather.Maximum.Value - 32) * 5 / 9;

    setDefaultCity({
      ...defaultCity,
      name: visibleItem,
      temp: (c).toFixed(),
      fiveDays: arr
    });
  }
 
  useEffect(() => {
    const res = fetch(locationApiUrl())
      .then(response => response.json())
      .then(info => {

        search(info, term);
        info.map(item => {
          if (item.LocalizedName === visibleItem) {
            setDefaultCity({
              ...defaultCity,
              name: item.LocalizedName,
    
            })
          }
        })
      })
      .catch(err => {
        throw new Error(`Could not fetch: ${err}. The API you used has expired. You need to use the new API. You can do this at https://developer.accuweather.com/`)
      })
    return () => res
  }, [ term, term ]);




  useEffect(() => {
    const res2 = fetch(weatherApiUrl(key))
      .then(response => response.json())
      .then(res => {
        renderWeather(res);
      })
      .catch(err => {
        throw new Error(`Could not fetch: ${err}`)
      })
    return () => res2;
  }, [ term, key ]);

  const home = (
    <div className="App">
      <div>
    
        <br />
        <br />

        <div className="form-group">
  
          <button
            onClick={(e) => addToFavorites(defaultCity)}
            type="button"
            className="btn btn-success"
          >Add To Favorites</button>
          <br /><br />
          
          {!autocompleteFlag ? null : visibleItem === 'Dhaka'
            ? null : (<table className={"table table-hover"}>
              <tbody>
                <tr className={cls} >
                  <th scope="row"><h1>{defaultCity.name}</h1></th>
                </tr>
              </tbody>
            </table>)
          }
          <input
            onChange={onSearch}
            className="form-control form-control-lg"
            type="text"
            placeholder="Search for a city..."
            id="inputLarge" />
        </div>
 
    
        <div className="card border-primary mb-3" style={{ maxWidth: "20rem" }}>
          <div className="card-body">
            <h4 className="card-title">{visibleItem == 'Dhaka' ? 'Tel Aviv' : visibleItem}</h4>
            <p className="card-text">{defaultCity.temp}C</p>
          </div>
        </div>
   
        
        <h1>Scattered Clouds</h1>

        <div style={{ display: 'flex' }}>
          {defaultCity.fiveDays.map((day, index) => (
        
            <div key={index} className="card border-primary mb-3" style={{ maxWidth: "20rem" }}>
     
              <div className="card-body">
                <h4 className="card-title">{day.day}</h4>
                <p className="card-text">{day.temp}C</p>
              </div>
            </div>
     
          ))}
        </div>
   
  
      </div>
    </div>
  )
  
  const deleteFav = (i) => {
    
    const copy = [ ...favorites ];
    copy.splice(i, 1);

    setFavorites(copy);
  }

  const favDetails = (item) => {
    setHomeFlag(true);
    setFavFlag(false);
    setTerm(item.name);
    setAutocompleteFlag(false)
    setDefaultCity(item)
    return item
  }


  const fav = (
    <div>

      <h1>Favorites</h1>
  
      <div style={{ display: 'flex' }}>
        {!favorites
          ? null
          : favorites.map((item, index) => {
        
            return (
              <div key={index + item.name}>
                <div style={{ display: 'flex' }}>
                  <div className="card border-success  mb-3" style={{ maxWidth: "20rem" }}>
                    <div className="card-header"><h1 onClick={() => deleteFav(index)}>&times;</h1></div>
                    <div onClick={() => favDetails(item)} className="card-body">
                      
                      <h3 className="card-title">{item.name}</h3>
                      <h4 className="card-text">{item.temp}C</h4>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )


  const homeFunc = () => {
    setHomeFlag(true)
    setFavFlag(false)
  }

  const favFunc = () => {
    setFavFlag(true)
    setHomeFlag(false)
  }
  
  return (
    <div >
      <div>
        <br />
      &nbsp;
      <button onClick={homeFunc}
          type="button" className="btn btn-primary">Home</button>
      &nbsp;

      <button onClick={favFunc}
          type="button" className="btn btn-primary">Favorites</button>
          &nbsp;
          
        <hr />
      </div>

      {homeFlag ? home : null}
      {favFlag ? fav : null}
    </div>
  );
}

