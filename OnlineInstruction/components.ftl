
<#-- Component for alternate board list (Conversations.category-browser) -->


<#include "common-functions" />

	<#assign categoryQuery = "SELECT * FROM categories WHERE parent_category.id = '${coreNode.id}'"/>
	<#assign boardQuery = "SELECT messages.count(*),id, title, description, view_href  FROM boards WHERE parent_category.id='${coreNode.id}' ORDER BY position ASC"/>



<#--//        To get user unread items
//<#assign Messages = rest("2.0", "/search?q=" + "select user_context.read from messages"?url).data.items />
-->



<#if categoryQuery?? && categoryQuery != "">
	<#-- Get all the categories at this level. -->
	<#assign categories = executeLiQLQuery(categoryQuery) />

	<#-- 
		A little extra (optional) work here; get boards in the categories now. 
		We use the results from this below; when we list out the categories
	-->
	<#assign categoryList = ""/>
	<#list categories as category >
		<#assign categoryList = categoryList + "'${category.id}',"/>
	</#list>
	<#assign categoryList = categoryList?remove_ending(",") />

	<#if categoryList != "" && coreNode.nodeType != "community">
		<#assign subCatBoardsQuery = "SELECT * FROM boards WHERE parent_category.id IN (${categoryList}) ORDER BY position ASC" />
		<#assign subCatBoards = executeLiQLQuery(subCatBoardsQuery) />
	</#if>
</#if>
        <div class="conversations-category-browser">
<#-- list out all boards at this node level -->
            <div class="board-list">
<#if boardQuery?? && boardQuery != "">

<#assign boards = executeLiQLQuery(boardQuery) />
	<#list boards as board>

                <#-- fill the latest activity variable -->
            <#assign lastActivityQuery = "SELECT conversation.last_post_time_friendly, conversation.last_post_time FROM messages where board.id = '${board.id}' and depth = 0 order by conversation.last_post_time desc limit 1"/>
            <#assign lastActivity = executeLiQLQuery(lastActivityQuery) />
            <#list lastActivity as a>
                <#if a.conversation.last_post_time_friendly??>
                <#assign lastFriendly = a.conversation.last_post_time_friendly />
                <#elseif a.conversation.last_post_time??>
                <#assign lastFriendly = a.conversation.last_post_time?date />
                </#if>
            </#list>

            <#-- fill the new message variable -->
            <#assign unreadQuery = "SELECT user_context.read FROM messages where board.id = '${board.id}'"/>
            <#assign unread = executeLiQLQuery(unreadQuery) />
            <#assign newMessage = 0 /> 
            <#list unread as m>
              <#assign newMessage = newMessage + m.user_context.read?then(0,1) />
            </#list>


                <div class="board-item">
                    <h3 id="${board.id}"><a href="${board.view_href}">${board.title}</a></h3>
			<h4>${board.description}</h4>
                        <h5>Last Activity:<br>${lastFriendly!"none"}</h5>
                    <div>
                        <span>${board.messages.count!"0"}<br>Posts</span>
                        <span>${newMessage!"0"}<br>Unread</span>
                    </div>

                </div>
	</#list>
</#if>

            <div class="category-list">
<#--list out all categories at this level -->
<#if categories?? && categories != "">
	<#list categories as category >
                <div class="category-wrapper ${utils.css.toValidClassName(category.title)}">
                    <h3 class="category-title">${category.title}</h3>
                    <span class="desc">${category.description}</span>
                    
			<#if subCatBoards?? >
			<#-- list out boards that are children of the subcategory we are currently looking at. The work we did before means we don't need another RETS API call inside of a loop. -->
                    <div class="sub-board-list">
				<#list subCatBoards as subBoard >
					<#if subBoard.parent_category.id == category.id>
                        <div class="sub-board-item">
                            <a href="${subBoard.view_href}">${subBoard.title}</a>
                            </div>
					</#if>
				</#list>
                        </div> 
			</#if>
                    </div>
	</#list>
</#if>
                </div> <#-- end category list -->
            </div> <#-- end board list -->
            </div>        






<#-- custom.hero-banner -->

<div id="hero-banner" style="background-image: url(/html/assets/<@component id="common.widget.custom-content" name="2"/>);">
<div id="hero-subhead"><@component id="common.widget.custom-content" name="1"/></div>
<h1>
<#attempt>
${env.context.component.getParameter('altTitle')}
<#recover>
<@component id="common.widget.page-title"/>
</#attempt>
</h1>
</div>

<#-- custom.restricted-start-article -->
<#if user.registered >
  <#assign is_user_admin = false />
  <#list restadmin("/users/id/${user.id?c}/roles").roles.role as role>
    <#if role.name?? && (role.name == "Administrator" || role.name == "Moderator")>
      <#assign is_user_admin = true />
      <#break />
    </#if>
  </#list>
  <#if is_user_admin >
    <@component id="forums.widget.menu-bar"/>
  </#if>
</#if>


