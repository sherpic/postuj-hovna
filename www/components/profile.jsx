import React from 'react';
import ProfileStore from '../stores/profile-store';

export default class Profile extends React.Component {
  constructor(...props) {
    super(...props);
  }
  render() {
    return <div>Profil
     <button className="btn" onClick={ProfileStore.login}>PŘIHLÁSIT</button>
    </div>;
  }
}
