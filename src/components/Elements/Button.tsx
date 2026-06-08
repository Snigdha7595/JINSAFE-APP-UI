type buttonTypo = {
    color?:
      | 'default'
      | 'primary'
      | 'secondary'
      | 'tertiary'
      | 'dark-tertiary'
      | 'success'
      | 'warning'
      | 'danger'
      | 'gradient'
      | 'themeLightShade'
      | 'disabled';
    varient?: 'solid' | 'faded' | 'bordered' | 'light' | 'flat';
    size?: 'sm' | 'md' | 'lg' | 'w-100';
    radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
    type?: 'button' | 'submit' | 'reset' | undefined;
    children: any;
    clickHandler?: any;
    customClass?:string;
    isDisabled?:boolean;
    reference?:any;
    name?:string;
  };
  
  const Button = ({
    children,
    color,
    varient,
    size,
    radius,
    type,
    clickHandler,
    customClass,
    isDisabled,
    reference,
    name

  }: buttonTypo) => {
    const btnClr = color !== undefined ? color : 'default';
    const btnVarient = varient !== undefined ? varient : 'solid';
    const btnSize = size !== undefined ? size : 'sm';
    const btnRadius = radius !== undefined ? radius : 'sm';
    return (
      <>
        <button
          type={type ? type : 'button'}
          onClick={clickHandler}
          disabled={isDisabled}
          ref={reference}
          name={name}
          className={`u-button ${btnClr} ${btnVarient} size-${btnSize} radius-${btnRadius} ${customClass != "" && customClass != undefined ? customClass : ''} ${isDisabled && 'disabled'}`}
        >
          {children}
        </button>
      </>
    );
  };
  
  export default Button;
  