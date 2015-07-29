import page  	  from 'page';
import React 	  from 'react';
import Immutable  from 'immutable';
import classNames from 'classnames';

import Action          from '../actions';
import UserAction      from '../actions/user';
import SettingsAction  from '../actions/settings';
import BroadcastAction from '../actions/broadcast';

import UserStore    from '../stores/user';
import Avatar       from '../components/avatar';
import Dropdown     from '../components/dropdown';
import MemberDialog from '../components/dialog/board-members';

import UserVoice   from '../components/user-voice';
import InfoView    from './dialog/view-info';
import AboutView   from './dialog/view-about';
import ProfileView from './dialog/edit-profile';

import Board from '../models/board';

import ActivityStore from '../stores/user-activity';

import listener    from '../mixins/listener';
import localeMixin from '../mixins/locale';

/**
 *
 */
export default React.createClass({
	mixins: [
		listener(ActivityStore),
		localeMixin()
	],

	propTypes: {
		title: React.PropTypes.string.isRequired,
		showHelp: React.PropTypes.bool,
		killReview: React.PropTypes.func,
		board: (props) => {
			if(!props.board instanceof Board) throw new Error();
		}
	},

	componentDidMount() {
		// If userstore is empty then go back to login
		if(!UserStore.getUser()) return page.redirect('/login');

		//this is not good... but what is!
		//get areas like the board component and workspace
		let contentArea = document.getElementById("content");
		contentArea.addEventListener("click", (event) => {
			if(this.state.dropdown) {
				this.toggleDropdown();
				window.UserVoice.push([ 'hide' ]);
			}
		});
	},

	onChange() {
		this.setState({
			members: this.props.board
				? ActivityStore.getMembers(this.props.board.id)
				: Immutable.List()
		});
	},

	getInitialState() {
		return {
			members: this.props.board
				? ActivityStore.getMembers(this.props.board.id)
				: Immutable.List(),
			dropdown: false, localesDropdown: false,
			feedback: false, infoActive: false,
			aboutActive: false, membersActive: false,
			profileActive: false
		}
	},

	showWorkspace() {
		return page.show('/boards');
	},

	toggleMembersDialog() {
		this.setState({ membersActive: !this.state.membersActive });
	},

	toggleDropdown() {
		this.setState({ dropdown: !this.state.dropdown });
		if(this.state.localesDropdown) this.toggleLocaleDropdown();
	},

	toggleInfoView() {
		this.setState({ infoActive: !this.state.infoActive });
	},

	toggleAboutView() {
		this.setState({ aboutActive: !this.state.aboutActive });
	},

	toggleLocaleDropdown() {
		this.setState({ localesDropdown: !this.state.localesDropdown });
	},

	toggleProfileView() {
		this.setState({ profileActive: !this.state.profileActive });
	},

	boardMembersAmount() {
		if(!this.props.board) return null;

		return this.state.members.filter((member) => {
			return member.get('date') > new Date(new Date().getTime() - (5 * 60000));
		}).size;
   },

	render() {
		let infoDialog = null;
		let aboutDialog = null;
		let profileDialog = null;
		let infoIcon = null;

		if(!this.state.infoActive) {
			infoIcon = 'question';
			infoDialog = null;
		} else {
			infoIcon = 'times';
			infoDialog = <InfoView onDismiss = { this.toggleInfoView }  board={this.props.board}/>;
		}

		if(!this.state.aboutActive) {
			aboutDialog = null;
		} else {
			aboutDialog = <AboutView onDismiss = { this.toggleAboutView } />;
		}

		if(!this.state.profileActive) {
			profileDialog = null;
		} else {
			profileDialog = <ProfileView formProfile="profileSettings" onDismiss = { this.toggleProfileView } />;
		}

		let infoButtonClass =
			classNames(
				'infobutton',
				{ active: this.state.infoActive }
			);

		let userButtonClass =
			classNames(
				'avatar-wrapper',
				{ active: this.state.dropdown }
			);

		let membersButtonClass =
			classNames(
				'members',
				{ active: this.state.membersActive }
			);

		let boardMembersDialog = null;

		if (this.state.membersActive) {
			boardMembersDialog = <MemberDialog members={this.state.members} onDismiss={this.toggleMembersDialog}/>
		}

		let showBoardMembers = !this.props.showBoardMembers ? null : (
			<div id="members" onClick={this.toggleMembersDialog} className={membersButtonClass}>
				<span className="fa fa-fw fa-users">
					<span className="user-amount">
						{this.boardMembersAmount()}
					</span>
				</span>
			</div>
		);

		let showInfo = !this.props.showHelp ? null : (
			<div id="info" onClick={this.toggleInfoView} className={infoButtonClass}>
				<span className={`fa fa-fw fa-${infoIcon}`}></span>
			</div>
			);

		let user              = UserStore.getUser();
		let items = [
			{
				disabled: true,
				customclass: 'profile-name',
				content: `${this.locale('DROPDOWN_HELLO')}, ${user.name}`
			},
			{
				icon: 'user',
				content: this.locale('DROPDOWN_PROFILE'),
				onClick: () => {
					this.toggleProfileView();
					this.toggleDropdown();
				}
			},
			{
				icon: 'language',
				content: this.locale('DROPDOWN_LOCALE'),
				onClick: () => {
					this.toggleLocaleDropdown()
				}
			},
			{
				icon: 'bullhorn',
				nospan: true,
				content: (
					<UserVoice>
						{this.locale('DROPDOWN_FEEDBACK')}
					</UserVoice>
				)
			},
			{
				icon: 'info',
				content: this.locale('DROPDOWN_ABOUT'),
				onClick: () => {
					this.toggleAboutView();
				}
			},
			{
				icon: 'sign-out',
				content: this.locale('DROPDOWN_LOGOUT'),
				onClick: () => {
					UserAction.logout()
						.catch((err) => {
							BroadcastAction.add(err, Action.User.Logout);
						});
				}
			}
		];
		let locales = [
			{
				flag: 'gb',
				content: 'English',
				onClick: () => {
					SettingsAction.setSetting('locale', 'en');
					this.toggleDropdown();
				}
			},
			{
				flag: 'fi',
				content: 'Suomi',
				onClick: () => {
					SettingsAction.setSetting('locale', 'fi');
					this.toggleDropdown();
				}
			},
			{
				flag: 'se',
				content: 'Svenska',
				onClick: () => {
					SettingsAction.setSetting('locale', 'se');
					this.toggleDropdown();
				}
			},
			{
				flag: 'dk',
				content: 'Dansk',
				onClick: () => {
					SettingsAction.setSetting('locale', 'dk');
					this.toggleDropdown();
				}
			},
			{
				flag: 'jp',
				content: '日本語',
				onClick: () => {
					SettingsAction.setSetting('locale', 'jp');
					this.toggleDropdown();
				}
			}
		];

		return (
			<nav id="nav" className="nav">
				<img className="logo" src="/dist/assets/img/logo.svg"
					onClick={this.showWorkspace} />
				<h1 className="title">{this.props.title}</h1>
				{showBoardMembers}
				{showInfo}
				<div id="avatar" onClick={this.toggleDropdown} className={userButtonClass}>
						<Avatar size={30} name={user.name}
								imageurl={user.avatar}
								isOnline={true}
								usertype={user.type}>
						</Avatar>
				</div>
				<Dropdown ref="dropdown" className="options" show={this.state.dropdown} items={items} />
				<Dropdown className="locales" show={this.state.localesDropdown} items={locales} />
				{infoDialog}
				{boardMembersDialog}
				{aboutDialog}
				{profileDialog}
			</nav>
		);
	}
});
