import React, { PureComponent } from 'react';

import classNames from 'classnames';

import css from './Tabbed.less';

import {
  addScroller,
  removeScroller
} from '../util/scroller';

import {
  addDragger
} from '../util/dragger';

import {
  debounce
} from '../../util';

const noop = () => {};

const TABS_OPTS = {
  selectors: {
    tabsContainer: '.tabs-container',
    tab: '.tab',
    active: '.active',
    ignore: '.ignore'
  }
};


export default class TabLinks extends PureComponent {
  constructor(props) {
    super(props);

    this.updateScroller = debounce(this.updateScroller);

    this.tabLinksRef = React.createRef();
  }

  componentDidMount() {
    const {
      draggable,
      scrollable
    } = this.props;

    if (draggable) {
      addDragger(this.tabLinksRef.current, TABS_OPTS, this.handleDrag);
    }

    if (scrollable) {
      this.scroller = addScroller(this.tabLinksRef.current, TABS_OPTS, this.handleScroll);
    }
  }

  componentWillUnmount() {
    if (this.scroller) {
      removeScroller(this.scroller);

      this.scroller = null;
    }
  }

  updateScroller = () => {
    if (this.scroller) {
      this.scroller.update();
    }
  }

  componentDidUpdate() {
    this.updateScroller();
  }

  handleScroll = (node) => {
    const {
      onSelect,
      tabs
    } = this.props;

    const tab = tabs.find(({ id }) => id === node.dataset.tabId);

    onSelect(tab);
  }

  handleDrag = ({ dragTab, newIndex }) => {
    const {
      tabs,
      onMoveTab
    } = this.props;

    const tab = tabs.find(({ id }) => id === dragTab.dataset.tabId);

    onMoveTab(tab, newIndex);
  }

  isDirty = (tab) => {
    const {
      dirtyTabs,
      unsavedTabs
    } = this.props;

    return (dirtyTabs && !!dirtyTabs[ tab.id ]) ||
           (unsavedTabs && !!unsavedTabs[ tab.id ]);
  }

  render() {

    const {
      activeTab,
      tabs,
      onSelect,
      onContextMenu,
      onClose,
      onCreate,
      className
    } = this.props;

    return (
      <div
        className={ classNames(css.LinksContainer, className) }
        ref={ this.tabLinksRef }>
        <div className="tabs-container">
          {
            tabs.map(tab => {
              const dirty = this.isDirty(tab);

              return (
                <span
                  key={ tab.id }
                  data-tab-id={ tab.id }
                  className={ classNames('tab', {
                    active: tab === activeTab,
                    dirty
                  }) }
                  onClick={ () => onSelect(tab, event) }
                  onContextMenu={ (event) => (onContextMenu || noop)(tab, event) }
                  draggable
                >
                  {tab.name}
                  {
                    onClose && <span
                      className="close"
                      onClick={ e => {
                        e.preventDefault();
                        e.stopPropagation();

                        onClose(tab);
                      } }
                    />
                  }
                </span>
              );
            })
          }

          {
            onCreate && <span
              key="empty-tab"
              className={ classNames('tab ignore', {
                active: tabs.length === 0
              }) }
              onClick={ () => onCreate() }
            >
              +
            </span>
          }
        </div>
      </div>
    );
  }
}