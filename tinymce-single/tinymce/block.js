( function( tinymce, wp, _ ) {
	tinymce.PluginManager.add( 'block', function( editor ) {
		var getSelectedBlock = wp.blocks.getSelectedBlock;

		// Global controls

		function isNodeEligibleForControl( node, name ) {
			var block;

			if ( ! node ) {
				return false;
			}

			block = wp.blocks.getBlockSettingsByElement( node );
			return block && _.includes( block.controls, name );
		}

		_.forEach( wp.blocks.getControls(), function( control, name ) {
			var settings = {
				icon: control.icon
			};

			if ( control.onClick ) {
				settings.onClick = function() {
					control.onClick( getSelectedBlock() );
					editor.nodeChanged();
				};
			}

			if ( control.isActive ) {
				settings.onPostRender = function() {
					var button = this;

					editor.on( 'nodechange', function() {
						var block = getSelectedBlock();

						if ( isNodeEligibleForControl( block, name ) ) {
							button.active( control.isActive( block ) );
						}
					} );
				};
			}

			editor.addButton( name, settings );
		} );

		function addfigcaption() {
			var block = getSelectedBlock();

			if ( ! editor.$( block ).find( 'figcaption' ).length ) {
				var figcaption = editor.$( '<figcaption><br></figcaption>' );

				editor.undoManager.transact( function() {
					editor.$( block ).append( figcaption );
					editor.selection.setCursorLocation( figcaption[0], 0 );
				} );
			}
		}

		function removefigcaption() {
			var block = getSelectedBlock();
			var figcaption = editor.$( block ).find( 'figcaption' );

			if ( figcaption.length ) {
				editor.undoManager.transact( function() {
					figcaption.remove();
				} );
			}
		}

		editor.addButton( 'togglefigcaption', {
			icon: 'gridicons-caption',
			onClick: function() {
				var block = getSelectedBlock();

				if ( editor.$( block ).find( 'figcaption' ).length ) {
					removefigcaption();
				} else {
					addfigcaption();
				}
			},
			onPostRender: function() {
				var button = this;

				editor.on( 'nodechange', function( event ) {
					var block = getSelectedBlock();

					button.active( editor.$( block ).find( 'figcaption' ).length > 0 );
				} );
			}
		} );

		// Attach block UI.

		editor.on( 'preinit', function() {
			var DOM = tinymce.DOM;

			editor.addButton( 'block', {
				icon: 'gridicons-posts',
				tooltip: 'Add Block',
				onPostRender: function() {
					var button = this;

					editor.on( 'nodechange', function( event ) {
						var block = getSelectedBlock();
						var settings = wp.blocks.getBlockSettingsByElement( block );

						if ( settings ) {
							button.icon( settings.icon );
						}
					} );
				}
			});

			function removeBlock() {
				var $blocks = editor.$( getSelectedBlock() );
				var p = editor.$( '<p><br></p>' );

				editor.undoManager.transact( function() {
					$blocks.first().before( p );
					editor.selection.setCursorLocation( p[0], 0 );
					$blocks.remove();
				} );
			}

			function moveBlockUp() {
				$blocks = getBlockSelection();
				$first = $blocks.first();
				$last = $blocks.last();
				$prev = $first.prev();

				rect = $first[0].getBoundingClientRect();

				if ( $prev.length ) {
					editor.undoManager.transact( function() {
						$last.after( $prev );
					} );

					editor.nodeChanged();
					window.scrollBy( 0, - rect.top + $first[0].getBoundingClientRect().top );
				}
			}

			function moveBlockDown() {
				$blocks = getBlockSelection();
				$first = $blocks.first();
				$last = $blocks.last();
				$next = $last.next();

				rect = $first[0].getBoundingClientRect();

				if ( $next.length ) {
					editor.undoManager.transact( function() {
						$first.before( $next );
					} );

					editor.nodeChanged();
					window.scrollBy( 0, - rect.top + $first[0].getBoundingClientRect().top );
				}
			}

			editor.addButton( 'up', {
				icon: 'gridicons-chevron-up',
				tooltip: 'Up',
				onClick: moveBlockUp,
				classes: 'widget btn move-up'
			} );

			editor.addButton( 'down', {
				icon: 'gridicons-chevron-down',
				tooltip: 'Down',
				onClick: moveBlockDown,
				classes: 'widget btn move-down'
			} );

			var insert = false;

			editor.addButton( 'add', {
				icon: 'gridicons-add-outline',
				tooltip: 'Add Block',
				onClick: function() {
					insert = true;
					editor.nodeChanged();
				}
			} );

			// Adjust icon of TinyMCE core buttons.
			editor.buttons.bold.icon = 'gridicons-bold';
			editor.buttons.italic.icon = 'gridicons-italic';
			editor.buttons.strikethrough.icon = 'gridicons-strikethrough';
			editor.buttons.link.icon = 'gridicons-link';

			var blockToolbarWidth = 0;

			function createBlockOutline() {
				var outline = document.createElement( 'div' );

				outline.className = 'block-outline';
				document.body.appendChild( outline );

				return outline;
			}

			function createInsertToolbar() {
				var insert = editor.wp._createToolbar( [ 'add' ] );

				insert.$el.addClass( 'block-toolbar' );

				insert.reposition = function () {
					var elementRect = getSelectedBlock().getBoundingClientRect();
					var contentRect = editor.getBody().getBoundingClientRect();

					DOM.setStyles( this.getEl(), {
						position: 'absolute',
						left: contentRect.left + 50 + 'px',
						top: elementRect.top + window.pageYOffset + 'px'
					} );

					this.show();
				}

				return insert;
			}

			function createInsertMenu() {
				var insertMenu = editor.wp._createToolbar( ( function() {
					var allSettings = wp.blocks.getBlocks();
					var buttons = [];
					var key;

					for ( key in allSettings ) {
						if ( allSettings[ key ].insert ) {
							buttons.push( {
								icon: allSettings[ key ].icon,
								onClick: allSettings[ key ].insert
							} );
						}
					}

					buttons.push( {
						text: 'Work in progress',
						onClick: function() {}
					} );

					return buttons;
				} )() );

				insertMenu.reposition = function () {
					var toolbar = this.getEl();
					var toolbarRect = toolbar.getBoundingClientRect();
					var elementRect = getSelectedBlock().getBoundingClientRect();
					var contentRect = editor.getBody().getBoundingClientRect();

					DOM.setStyles( toolbar, {
						position: 'absolute',
						left: contentRect.left + 100 + 'px',
						top: elementRect.top + window.pageYOffset + 'px'
					} );

					this.show();
				}

				return insertMenu;
			}

			function createInlineToolbar() {
				var inline = editor.wp._createToolbar( [ 'bold', 'italic', 'strikethrough', 'link' ] );

				inline.reposition = function () {
					var toolbar = this.getEl();
					var toolbarRect = toolbar.getBoundingClientRect();
					var elementRect = getSelectedBlock().getBoundingClientRect();

					DOM.setStyles( toolbar, {
						position: 'absolute',
						left: elementRect.left + 8 + blockToolbarWidth + 'px',
						top: elementRect.top + window.pageYOffset - toolbarRect.height - 8 + 'px'
					} );

					this.show();
				}

				return inline;
			}

			function createBlockNavigation() {
				var navigation = editor.wp._createToolbar( [ 'up', 'down' ] );

				navigation.$el.addClass( 'block-toolbar' );

				navigation.reposition = function () {
					var toolbar = this.getEl();
					var toolbarRect = toolbar.getBoundingClientRect();
					var elementRect = getSelectedBlock().getBoundingClientRect();

					var contentRect = editor.getBody().getBoundingClientRect();

					DOM.setStyles( toolbar, {
						position: 'absolute',
						left: contentRect.left + 50 + 'px',
						top: elementRect.top + window.pageYOffset + 'px'
					} );

					this.show();
				}

				return navigation;
			}

			function createBlockToolbars() {
				var settings = wp.blocks.getBlocks();
				var toolbars = {};
				var key;

				for ( key in settings ) {
					toolbars[ key ] = editor.wp._createToolbar( settings[ key ].controls || [] );
					toolbars[ key ].reposition = function () {
						var toolbar = this.getEl();
						var toolbarRect = toolbar.getBoundingClientRect();
						var elementRect = getSelectedBlock().getBoundingClientRect();

						DOM.setStyles( toolbar, {
							position: 'absolute',
							left: elementRect.left + 'px',
							top: elementRect.top + window.pageYOffset - toolbarRect.height - 8 + 'px'
						} );

						blockToolbarWidth = toolbarRect.width;

						this.show();
					}
				}

				return toolbars;
			}

			var UI = {
				outline: createBlockOutline(),
				insert: createInsertToolbar(),
				insertMenu: createInsertMenu(),
				inline: createInlineToolbar(),
				navigation: createBlockNavigation(),
				blocks: createBlockToolbars()
			};

			var anchorNode;
			var range;

			editor.on( 'blur', function() {
				UI.inline.hide();
				UI.insert.hide();
				hideBlockUI();
			} );

			function isEmptySlot( node, isAtRoot ) {
				// Text node.
				if ( node.nodeType === 3 ) {
					// Has text.
					if ( node.data.length ) {
						return false;
					} else {
						node = node.parentNode;
					}
				}

				// Element node.
				if ( node.nodeType === 1 ) {
					// Element is no direct child.
					if ( isAtRoot && node.parentNode !== editor.getBody() && node.nodeName !== 'P' ) {
						return false;
					}

					var childNodes = node.childNodes;
					var i = childNodes.length;

					// Loop over children.
					while ( i-- ) {
						// Text node.
						if ( childNodes[ i ].nodeType === 3 ) {
							// Has text.
							if ( childNodes[ i ].data.length ) {
								return false;
							}
						}

						// Element node.
						if ( childNodes[ i ].nodeType === 1 ) {
							// Is not BR.
							if ( childNodes[ i ].nodeName !== 'BR' ) {
								return false;
							}
						}
					}
				}

				return true;
			}

			var hasBlockUI = false;

			function hideBlockUI() {
				if ( hasBlockUI ) {
					tinymce.$( editor.getBody() ).removeClass( 'has-block-ui' );
					hasBlockUI = false;
				}

				UI.inline.hide();
				UI.navigation.hide();

				tinymce.each( UI.blocks, function( toolbar ) {
					toolbar.hide();
				} );

				DOM.setStyles( UI.outline, {
					display: 'none'
				} );
			}

			function focusToolbar( toolbar ) {
				var node = toolbar.find( 'toolbar' )[0];
				node && node.focus( true );
			}

			function showBlockUI( focus ) {
				var settings = wp.blocks.getBlockSettingsByElement( getSelectedBlock() ),
					controls;

				if ( ! hasBlockUI ) {
					tinymce.$( editor.getBody() ).addClass( 'has-block-ui' );
					hasBlockUI = true;
				}

				UI.navigation.reposition();

				tinymce.each( UI.blocks, function( toolbar, key ) {
					if ( key !== settings._id ) {
						toolbar.hide();
					}
				} );

				if ( settings ) {
					UI.blocks[ settings._id ].reposition();
					focus && focusToolbar( UI.blocks[ settings._id ] );

					if ( anchorNode.nodeType === 3 ) {
						UI.inline.reposition();
					} else {
						UI.inline.hide();
					}
				}
			}

			function isInputKeyEvent( event ) {
				var code = event.keyCode;
				var VK = tinymce.util.VK;

				if ( VK.metaKeyPressed( event ) ) {
					return false;
				}

				// Special keys.
				if ( code <= 47 && ! (
					code === VK.SPACEBAR || code === VK.ENTER || code === VK.DELETE || code === VK.BACKSPACE
				) ) {
					return false;
				}

				// OS keys.
				if ( code >= 91 && code <= 93 ) {
					return false;
				}

				// Function keys.
				if ( code >= 112 && code <= 123 ) {
					return false;
				}

				// Lock keys.
				if ( code >= 144 && code <= 145 ) {
					return false;
				}

				return true;
			}

			var hidden = true;
			var keypress = false;

			editor.on( 'keydown', function( event ) {
				keypress = true;

				if ( ! isInputKeyEvent( event ) ) {
					return;
				}

				// No typing directly on elements.
				if ( anchorNode.nodeType === 1 && ! isEmptySlot( anchorNode ) ) {
					event.preventDefault();
				} else {
					hidden = true;
				}

				insert = false;
			} );

			editor.on( 'keyup', function( event ) {
				keypress = false;
			} );

			editor.on( 'beforePastePreProcess beforeExecCommand', function( event ) {
				if ( anchorNode.nodeType === 1 && ! isEmptySlot( anchorNode ) ) {
					event.preventDefault();
				}
			} );

			editor.on( 'input', function( event ) {
				// Non key input (e.g. emoji).
				if ( keypress ) {
					return;
				}

				if ( anchorNode.nodeType === 1 && ! isEmptySlot( anchorNode ) ) {
					// Event not cancelable. :(
					// Let's see how this goes, it might be buggy.
					editor.undoManager.add();
					editor.undoManager.undo();
				}
			} );

			editor.on( 'mousedown touchstart', function() {
				hidden = false;
				insert = false;
			} );

			function getBlockSelection() {
				var startNode = editor.selection.getStart();
				var endNode = editor.selection.getEnd();
				var rootNode = editor.getBody();

				var $start = editor.$( editor.dom.getParent( startNode, function( element ) {
					return element.parentNode === rootNode;
				} ) );

				var $end = editor.$( editor.dom.getParent( endNode, function( element ) {
					return element.parentNode === rootNode;
				} ) );

				return $start.add( $start.nextUntil( $end ) ).add( $end );
			}

			editor.on( 'selectionChange nodeChange', function( event ) {
				var selection = window.getSelection();
				var isCollapsed = selection.isCollapsed;

				if ( ! selection.anchorNode ) {
					return;
				}

				if ( selection.anchorNode.parentNode.id === 'mcepastebin' ) {
					return;
				}

				if ( ! editor.getBody().contains( selection.anchorNode ) ) {
					return;
				}

				anchorNode = selection.anchorNode;

				var isEmpty = isCollapsed && isEmptySlot( anchorNode, true );
				var isBlockUIVisible = ! hidden;

				if ( isEmpty ) {
					window.console.log( 'Debug: empty node.' );

					hideBlockUI();
					UI.inline.hide();
					UI.insert.reposition();
				} else {
					UI.insert.hide();

					if ( isBlockUIVisible ) {
						var selectedBlocks = getBlockSelection();

						if ( selectedBlocks.length === 1 ) {
							showBlockUI();
						} else {
							hideBlockUI();
							UI.navigation.reposition();
						}

						var startRect = selectedBlocks.first()[0].getBoundingClientRect();
						var endRect = selectedBlocks.last()[0].getBoundingClientRect();

						DOM.setStyles( UI.outline, {
							display: 'block',
							position: 'absolute',
							left: Math.min( startRect.left, endRect.left ) + 'px',
							top: startRect.top + window.pageYOffset + 'px',
							height: endRect.bottom - startRect.top + 'px',
							width: Math.max( startRect.width, endRect.width ) + 'px'
						} );
					} else {
						hideBlockUI();
					}
				}

				if ( insert ) {
					UI.insertMenu.reposition();
				} else {
					UI.insertMenu.hide();
				}
			} );

			editor.on( 'nodeChange', function( event ) {
				insert = false;
			} );

			var metaCount = 0;

			editor.on( 'keydown', function( event ) {
				var keyCode = event.keyCode;
				var VK = tinymce.util.VK;
				var block = getSelectedBlock();

				if ( block.nodeName === 'FIGURE' ) {
					if ( keyCode === VK.ENTER ) {
						addfigcaption();
						event.preventDefault();
					}

					if ( keyCode === VK.BACKSPACE ) {
						var caretEl = editor.selection.getNode();

						if ( caretEl.nodeName !== 'FIGCAPTION' ) {
							removeBlock();
							event.preventDefault();
						} else {
							var range = editor.selection.getRng();

							if ( range.collapsed && range.startOffset === 0 ) {
								removefigcaption();
								event.preventDefault();
							}
						}
					}

					if ( keyCode === VK.LEFT ) {
						var range = editor.selection.getRng();

						if ( keyCode === VK.LEFT && range.startOffset === 0 ) {
							event.preventDefault();
						}
					}
				} else {
					if ( keyCode === VK.BACKSPACE ) {
						var selection = window.getSelection();

						if ( ! selection.isCollapsed && editor.dom.isBlock( selection.focusNode ) ) {
							if ( selection.anchorOffset === 0 && selection.focusOffset === 0 ) {
								if ( block.nextSibling && block.nextSibling.contains( selection.focusNode ) ) {
									removeBlock();
									event.preventDefault();
								}
							}

							if ( selection.anchorOffset === 0 && selection.anchorNode === selection.focusNode ) {
								removeBlock();
								event.preventDefault();
							}
						}
					}
				}

				if ( VK.metaKeyPressed( event ) ) {
					metaCount ++;
				} else {
					metaCount = 0;
				}

				if ( keyCode === 27 ) {
					hideBlockUI();
				}
			}, true );

			editor.on( 'keyup', function( event ) {
				if ( metaCount === 1 ) {
					var selection = window.getSelection();

					if ( selection.isCollapsed && isEmptySlot( selection.anchorNode, true ) ) {
						return;
					}

					showBlockUI( true );
				}

				metaCount = 0;
			} );

			editor.on( 'dragstart', function( event ) {
				var block = getSelectedBlock();

				if ( block.nodeName === 'FIGURE' ) {
					event.preventDefault();
				}
			} );
		} );
	} );
} )( window.tinymce, window.wp, window._ );
