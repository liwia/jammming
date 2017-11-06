const clientId = '47a851e4f10f4e3fb5149b913b8e9ab0';
const redirectURI = 'http://localhost:3000/';
let accessToken;

const Spotify = {
  getAccessToken(){
    if(accessToken){
      return accessToken;
    }
//If the access token is not already set, check the URL to see if it has just been obtained.
      const retrievedAccessToken = window.location.href.match(/access_token([^&]*)/);
      const retrievedExpirationTime = window.location.href.match(/expires_in=([^&]*)/);

    if(retrievedAccessToken && retrievedExpirationTime){
      accessToken = retrievedAccessToken[1];
      const expiresIn = Number(retrievedExpirationTime[1]);
      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');
      // This clears the parameters, allowing us to grab a new access token when it expires.
      return accessToken;
      //should I return accessToken?
}
    else{
      const url = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
      window.location = url;
  }

},
  search(term){
      const accessToken = Spotify.getAccessToken();
      return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
    headers: { Authorization: `Bearer ${accessToken}`}
  }).then(response => {
      return response.json();
  }).then(jsonResponse => {
    if(!jsonResponse.tracks){
      return [];
    }
    return jsonResponse.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        uri: track.uri}
));
  });
},
  savePlaylist(playlistName, trackURIs){
    if(!playlistName || !trackURIs.length){return;}

    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}`};
    let userId;

    //Getting user ID
    return fetch('https://api.spotify.com/v1/me', {
      headers: headers}).then(response =>
      response.json()
  ).then(jsonResponse => {userId = jsonResponse.id;

        //New playlist on user's account
        return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`,{
          headers: headers,
          method: 'POST',
          body: JSON.stringify({name: playlistName})}).then(response =>
            response.json()
          ).then(jsonResponse => {const playlistId = jsonResponse.id;

              //Adding tracks to playlist on user's account
              return fetch(`https://api.spotify.com//v1/users/${userId}/playlists/${playlistId}/tracks`,{
                headers: headers,
                method: 'POST',
                body: JSON.stringify({uris: trackURIs})
              });
          });
        });
  }

};

export default Spotify;
