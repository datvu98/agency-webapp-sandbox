import styled from 'styled-components';

export default styled.div`
    cursor: pointer;

    .menu-header {    
        min-width: 160px;
        border-radius: 6px;
        box-shadow: 0 8px 10px rgba(0,0,0,.08);      
    }

    .header-avatar-wrapper {
      display: flex;
      align-items: center;      
    }

    .header-avatar {
        margin-right: 12px;
        border: 1px solid #e5e8eb;
        width: 40px; 
        height: 40px;
    }
`;

export const MenuHeaderWrapper = styled.div`
    .menu-header {           
        border: 1px solid #e5e5e5;
        width: 15 0px;        
        border-radius: 6px;
        box-shadow: 0 8px 10px rgba(0,0,0,.08);
    }
`;