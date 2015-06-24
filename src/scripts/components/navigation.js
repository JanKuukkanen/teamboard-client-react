import page  from 'page';
import React from 'react';

import Action          from '../actions';
import UserAction      from '../actions/user';
import BroadcastAction from '../actions/broadcast';

import Dropdown     from '../components/dropdown';
import MemberDialog from '../components/dialog/board-members';
import UserVoice from '../components/user-voice';
import InfoView  from  './dialog/view-info';

/**
 *
 */
export default React.createClass({
	propTypes: {
		title:            React.PropTypes.string.isRequired,
		showHelp:         React.PropTypes.bool,
		showBoardMembers: React.PropTypes.bool,
		board: (props) => {
			if(!props.board instanceof Board) throw new Error();
		}
	},

	getInitialState() {
		return { dropdown: false, feedback: false, infoActive: false, membersActive: false }
	},

	showWorkspace() {
		return page.show('/boards');
	},

	toggleMembersDialog() {
		this.setState({ membersActive: !this.state.membersActive });
	},

	toggleDropdown() {
		this.setState({ dropdown: !this.state.dropdown });
	},

	toggleInfoView() {
		this.setState({ infoActive: !this.state.infoActive });
	},

	render: function() {
		console.log(this.props.board);
		let infoDialog = null;
		let activeClick = null;
		let infoIcon = null;

		if(!this.state.infoActive) {
			infoIcon = 'info';
			infoDialog = null;
			activeClick = this.toggleDropdown;
		} else {
			infoIcon = 'times';
			infoDialog = <InfoView onDismiss = { this.toggleInfoView} />;
			activeClick = () => {};
		}

		let infoButtonClass =
			React.addons.classSet({
				infobutton: true,
				pulsate: localStorage.getItem('infovisited') === null
					? true : false,
				active: this.state.infoActive
			});

		let userButtonClass =
			React.addons.classSet({
				avatar: true,
				active: this.state.dropdown
			});

		let membersButtonClass =
			React.addons.classSet({
				members: true,
				active: this.state.membersActive
			});

		let boardMembersDialog = null;

		if (this.state.membersActive) {
			console.log('asd');
			boardMembersDialog = <MemberDialog board={this.props.board} onDismiss={this.toggleMembersDialog}/>
		}

		let showBoardMembers = !this.props.showBoardMembers ? null : (
			<div id="members" onClick={this.toggleMembersDialog} className={membersButtonClass}>
				<span className="fa fa-fw fa-users">
					<span className="user-amount">
						{this.props.board.members.length}
					</span>
				</span>
			</div>
		);

		let showInfo = !this.props.showHelp ? null : (
			<div id="info" onClick={this.toggleInfoView} className={infoButtonClass}>
				<span className={`fa fa-fw fa-${infoIcon}`}></span>
			</div>
			);

		let items = [
			{ icon: 'user', content: 'Profile', disabled: true },
			{ icon: 'language', content: 'Localization', disabled: true },
			{
				content: (
					<UserVoice>
						<span className="fa fa-fw fa-bullhorn" />
						Feedback
					</UserVoice>
				)
			},
			{
				onClick: () => {
					UserAction.logout()
						.then(() => {
							return page.show('/');
						})
						.catch((err) => {
							BroadcastAction.add(err, Action.User.Logout);
						});
				},
				icon: 'sign-out', content: 'Logout'
			}
		];
		return (
			<nav id="nav" className="nav">
				<img className="logo" src="/dist/assets/img/logo.svg"
					onClick={this.showWorkspace} />
				<h1 className="title">{this.props.title}</h1>
				{showBoardMembers}
				{showInfo}
				<div id="avatar" onClick={activeClick} className={userButtonClass}>
					<span className="fa fa-fw fa-user"></span>
				</div>
				<Dropdown show={this.state.dropdown} items={items} />
				{infoDialog}
				{boardMembersDialog}
			</nav>

		);
	}
});
